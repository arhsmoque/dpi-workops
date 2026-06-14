"""
Gmail fetcher — OAuth2 token management + thread ingestion.

Flow:
  1. GET /api/gmail/oauth/start  → redirect to Google consent screen
  2. GET /api/gmail/oauth/callback  → exchange code, store tokens
  3. POST /api/gmail/sync  → fetch recent threads, classify, upsert email_threads
"""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from typing import Optional

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from app.config import settings
from app.database import get_conn
from app.services.project_classifier import classify_email

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
]

_CLIENT_CONFIG = {
    "web": {
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "redirect_uris": [settings.google_redirect_uri],
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
    }
}


def build_flow() -> Flow:
    return Flow.from_client_config(
        _CLIENT_CONFIG,
        scopes=SCOPES,
        redirect_uri=settings.google_redirect_uri,
    )


def get_auth_url() -> str:
    flow = build_flow()
    url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="select_account",
    )
    return url


def exchange_code(code: str) -> str:
    """Exchange auth code for tokens, store in DB, return email address."""
    flow = build_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials

    # Discover the authed email
    user_info_svc = build("oauth2", "v2", credentials=creds)
    info = user_info_svc.userinfo().get().execute()
    email: str = info["email"]

    _store_tokens(email, creds)
    return email


def _store_tokens(email: str, creds: Credentials) -> None:
    expiry_iso = creds.expiry.isoformat() if creds.expiry else None
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO gmail_tokens (email, access_token, refresh_token, token_expiry, scopes, updated_at)
               VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(email) DO UPDATE SET
                   access_token  = excluded.access_token,
                   refresh_token = COALESCE(excluded.refresh_token, gmail_tokens.refresh_token),
                   token_expiry  = excluded.token_expiry,
                   scopes        = excluded.scopes,
                   updated_at    = CURRENT_TIMESTAMP""",
            (email, creds.token, creds.refresh_token, expiry_iso, json.dumps(creds.scopes)),
        )


def _load_creds(email: str) -> Optional[Credentials]:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM gmail_tokens WHERE email = ?", (email,)).fetchone()
    if not row:
        return None
    r = dict(row)
    expiry = datetime.fromisoformat(r["token_expiry"]) if r["token_expiry"] else None
    creds = Credentials(
        token=r["access_token"],
        refresh_token=r["refresh_token"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        scopes=json.loads(r["scopes"]) if r["scopes"] else SCOPES,
        expiry=expiry,
    )
    return creds


def _refresh_if_needed(email: str, creds: Credentials) -> Credentials:
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        _store_tokens(email, creds)
    return creds


def list_connected_accounts() -> list[str]:
    with get_conn() as conn:
        rows = conn.execute("SELECT email FROM gmail_tokens ORDER BY email").fetchall()
    return [r["email"] for r in rows]


def sync_threads(email: str, max_results: int = 200) -> dict:
    """Fetch recent threads for `email`, classify, upsert into email_threads.

    Returns summary: {ingested, classified, unclassified, skipped_existing}.
    """
    creds = _load_creds(email)
    if not creds:
        raise ValueError(f"No stored credentials for {email!r}. Complete OAuth first.")

    creds = _refresh_if_needed(email, creds)
    svc = build("gmail", "v1", credentials=creds)

    # Date filter: only fetch threads newer than N days
    cutoff = datetime.now(timezone.utc) - timedelta(days=settings.gmail_history_days)
    after_epoch = int(cutoff.timestamp())
    query = f"after:{after_epoch}"

    result = svc.users().threads().list(
        userId="me", q=query, maxResults=max_results
    ).execute()

    thread_items = result.get("threads", [])
    stats = {"ingested": 0, "classified": 0, "unclassified": 0, "skipped_existing": 0}

    for item in thread_items:
        thread_id = item["id"]

        # Skip threads already stored
        with get_conn() as conn:
            existing = conn.execute(
                "SELECT thread_id FROM email_threads WHERE thread_id = ?", (thread_id,)
            ).fetchone()
        if existing:
            stats["skipped_existing"] += 1
            continue

        # Fetch thread metadata (only headers, not full body to save quota)
        thread_data = svc.users().threads().get(
            userId="me",
            id=thread_id,
            format="metadata",
            metadataHeaders=["Subject", "From", "Date"],
        ).execute()

        subject, from_addr, received_at = _extract_headers(thread_data)
        snippet = (thread_data.get("messages") or [{}])[-1].get("snippet", "")[:300]
        gmail_link = f"https://mail.google.com/mail/u/0/#inbox/{thread_id}"

        project_code = classify_email(subject, snippet, from_addr)
        if project_code:
            stats["classified"] += 1
        else:
            stats["unclassified"] += 1
            project_code = "INT"  # fallback to internal

        with get_conn() as conn:
            conn.execute(
                """INSERT OR IGNORE INTO email_threads
                   (thread_id, gmail_account, subject, from_addr, snippet,
                    received_at, project_code, classified_at, gmail_link)
                   VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)""",
                (thread_id, email, subject, from_addr, snippet,
                 received_at, project_code, gmail_link),
            )
        stats["ingested"] += 1

    return stats


def _extract_headers(thread_data: dict) -> tuple[str, str, str]:
    """Extract Subject, From, Date from the first message of a thread."""
    messages = thread_data.get("messages", [])
    if not messages:
        return ("(no subject)", "", datetime.now(timezone.utc).isoformat())

    headers = {
        h["name"]: h["value"]
        for h in messages[0].get("payload", {}).get("headers", [])
    }
    subject = headers.get("Subject", "(no subject)")
    from_addr = headers.get("From", "")

    # Parse RFC 2822 date → ISO-8601
    date_str = headers.get("Date", "")
    try:
        from email.utils import parsedate_to_datetime
        received_at = parsedate_to_datetime(date_str).astimezone(timezone.utc).isoformat()
    except Exception:
        received_at = datetime.now(timezone.utc).isoformat()

    return subject, from_addr, received_at
