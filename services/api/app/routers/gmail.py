from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from app.config import settings
from app.database import get_conn
from app.services import gmail_fetcher
from app.services.audit_logger import log_event

router = APIRouter(prefix="/api/gmail", tags=["gmail"])


class SyncRequest(BaseModel):
    email: str
    max_results: int = 200


class SyncResult(BaseModel):
    email: str
    ingested: int
    classified: int
    unclassified: int
    skipped_existing: int


class ThreadOut(BaseModel):
    thread_id: str
    gmail_account: str
    subject: str
    from_addr: str
    snippet: str | None
    received_at: str
    project_code: str | None
    gmail_link: str
    is_processed: bool


@router.get("/oauth/start")
def oauth_start():
    """Redirect browser to Google consent screen."""
    if not settings.google_client_id:
        raise HTTPException(status_code=503, detail="Google OAuth not configured (GOOGLE_CLIENT_ID missing)")
    url = gmail_fetcher.get_auth_url()
    return RedirectResponse(url)


@router.get("/oauth/callback")
def oauth_callback(code: str = Query(...), error: str | None = Query(None)):
    """Handle Google OAuth callback — exchange code, store tokens."""
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error}")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    email = gmail_fetcher.exchange_code(code)
    log_event("Gmail OAuth connected", "oauth", f"Gmail account {email} linked",
              project_code=None, action_id=None, source="gmail")
    return {"status": "connected", "email": email}


@router.get("/accounts")
def list_accounts():
    """List all linked Gmail accounts."""
    return {"accounts": gmail_fetcher.list_connected_accounts()}


@router.post("/sync", response_model=SyncResult)
def sync(body: SyncRequest):
    """Trigger a Gmail thread sync for the given account."""
    try:
        stats = gmail_fetcher.sync_threads(body.email, max_results=body.max_results)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gmail API error: {exc}")

    log_event(
        "Gmail sync completed", "api",
        f"{body.email}: {stats['ingested']} ingested, {stats['classified']} classified",
        source="gmail",
    )
    return SyncResult(email=body.email, **stats)


@router.get("/threads", response_model=list[ThreadOut])
def list_threads(
    project_code: str | None = Query(None),
    unprocessed_only: bool = Query(False),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
):
    """Browse ingested email threads, optionally filtered by project."""
    clauses = []
    params: list = []
    if project_code:
        clauses.append("project_code = ?")
        params.append(project_code)
    if unprocessed_only:
        clauses.append("is_processed = 0")

    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    with get_conn() as conn:
        rows = conn.execute(
            f"SELECT * FROM email_threads {where} ORDER BY received_at DESC LIMIT ? OFFSET ?",
            [*params, limit, offset],
        ).fetchall()
    return [dict(r) for r in rows]


@router.patch("/threads/{thread_id}/mark-processed")
def mark_processed(thread_id: str):
    """Mark a thread as processed (action card created from it)."""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT thread_id FROM email_threads WHERE thread_id = ?", (thread_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Thread {thread_id!r} not found")
        conn.execute(
            "UPDATE email_threads SET is_processed = 1 WHERE thread_id = ?", (thread_id,)
        )
    return {"status": "ok", "thread_id": thread_id}
