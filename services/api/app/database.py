import sqlite3
from contextlib import contextmanager
from pathlib import Path
from app.config import settings

DDL = """
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS projects (
    code        TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    client      TEXT NOT NULL,
    risk_level  TEXT NOT NULL DEFAULT 'green'
                    CHECK(risk_level IN ('green','blue','amber','red','black')),
    description TEXT,
    next_meeting DATE,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS action_cards (
    id           TEXT PRIMARY KEY,
    project_code TEXT NOT NULL REFERENCES projects(code) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    risk_level   TEXT NOT NULL DEFAULT 'blue'
                     CHECK(risk_level IN ('green','blue','amber','red','black')),
    action_type  TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending-review'
                     CHECK(status IN (
                         'pending-review','in-review','pending-approval',
                         'approved','rejected','snoozed','closed'
                     )),
    priority     INTEGER NOT NULL DEFAULT 3 CHECK(priority BETWEEN 1 AND 5),
    due_date     DATE,
    next_step    TEXT NOT NULL,
    authority_text TEXT NOT NULL,
    ai_generated BOOLEAN NOT NULL DEFAULT 0,
    summary      TEXT,
    ai_reason    TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    action_id   TEXT NOT NULL REFERENCES action_cards(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL
                    CHECK(source_type IN (
                        'Gmail','Drive','Calendar','Attachment',
                        'Local File','Report','Audit','Manual Note'
                    )),
    label       TEXT NOT NULL,
    item_date   DATE NOT NULL,
    href        TEXT,
    is_primary  BOOLEAN NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS missing_info (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    action_id   TEXT NOT NULL REFERENCES action_cards(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS approval_items (
    id              TEXT PRIMARY KEY,
    action_id       TEXT NOT NULL REFERENCES action_cards(id) ON DELETE CASCADE,
    project_code    TEXT NOT NULL REFERENCES projects(code),
    proposed_action TEXT NOT NULL,
    consequence     TEXT NOT NULL,
    risk_level      TEXT NOT NULL
                        CHECK(risk_level IN ('green','blue','amber','red','black')),
    allowed_mode    TEXT NOT NULL DEFAULT 'desktop-only'
                        CHECK(allowed_mode IN ('desktop-only','phone-allowed','blocked')),
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK(status IN ('pending','approved','rejected','snoozed')),
    requested_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at     TIMESTAMP,
    resolved_by     TEXT
);

CREATE TABLE IF NOT EXISTS audit_events (
    id           TEXT PRIMARY KEY,
    timestamp    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event        TEXT NOT NULL,
    actor        TEXT NOT NULL,
    project_code TEXT REFERENCES projects(code),
    action_id    TEXT REFERENCES action_cards(id),
    detail       TEXT NOT NULL,
    source       TEXT
);

-- Sprint 1: Gmail OAuth tokens (one row per Gmail account)
CREATE TABLE IF NOT EXISTS gmail_tokens (
    email       TEXT PRIMARY KEY,
    access_token  TEXT NOT NULL,
    refresh_token TEXT,
    token_expiry  TEXT,          -- ISO-8601 UTC
    scopes      TEXT,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sprint 1: raw email thread index (source of truth before action classification)
CREATE TABLE IF NOT EXISTS email_threads (
    thread_id       TEXT PRIMARY KEY,
    gmail_account   TEXT NOT NULL REFERENCES gmail_tokens(email),
    subject         TEXT NOT NULL,
    from_addr       TEXT NOT NULL,
    snippet         TEXT,
    received_at     TIMESTAMP NOT NULL,
    project_code    TEXT REFERENCES projects(code),
    classified_at   TIMESTAMP,
    gmail_link      TEXT NOT NULL,
    is_processed    BOOLEAN NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Future sprints: drafts, attachments, parties

CREATE INDEX IF NOT EXISTS idx_actions_project ON action_cards(project_code);
CREATE INDEX IF NOT EXISTS idx_actions_status  ON action_cards(status);
CREATE INDEX IF NOT EXISTS idx_actions_risk    ON action_cards(risk_level);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_project   ON audit_events(project_code);
CREATE INDEX IF NOT EXISTS idx_sources_action  ON source_items(action_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_threads_project ON email_threads(project_code, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_processed ON email_threads(is_processed, received_at DESC);
"""


def get_db_path() -> Path:
    p = Path(settings.db_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def init_db() -> None:
    with sqlite3.connect(get_db_path()) as conn:
        conn.executescript(DDL)


@contextmanager
def get_conn():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
