import uuid
from datetime import datetime, timezone
from app.database import get_conn


def log_event(
    event: str,
    actor: str,
    detail: str,
    *,
    project_code: str | None = None,
    action_id: str | None = None,
    source: str | None = None,
) -> str:
    event_id = str(uuid.uuid4())
    ts = datetime.now(timezone.utc).isoformat()
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO audit_events (id, timestamp, event, actor, project_code, action_id, detail, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (event_id, ts, event, actor, project_code, action_id, detail, source),
        )
    return event_id
