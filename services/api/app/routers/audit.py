from fastapi import APIRouter, Query
from app.database import get_conn
from app.schemas.audit import AuditEvent, AuditEventCreate
from app.services.audit_logger import log_event

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("", response_model=list[AuditEvent])
def list_audit(
    project_code: str | None = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
):
    with get_conn() as conn:
        if project_code:
            rows = conn.execute(
                "SELECT * FROM audit_events WHERE project_code = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?",
                (project_code, limit, offset),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT ? OFFSET ?",
                (limit, offset),
            ).fetchall()
    return [dict(r) for r in rows]


@router.post("", response_model=AuditEvent, status_code=201)
def append_event(body: AuditEventCreate):
    log_event(
        body.event, body.actor, body.detail,
        project_code=body.project_code,
        action_id=body.action_id,
        source=body.source,
    )
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM audit_events WHERE id = (SELECT MAX(id) FROM audit_events WHERE event = ? AND actor = ?)",
            (body.event, body.actor),
        ).fetchone()
    return dict(row)
