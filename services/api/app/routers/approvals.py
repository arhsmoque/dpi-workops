from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.database import get_conn
from app.schemas.approval import ApprovalItem, ApprovalResolve
from app.services.audit_logger import log_event
from app.config import settings

router = APIRouter(prefix="/api/approvals", tags=["approvals"])


@router.get("", response_model=list[ApprovalItem])
def list_approvals(status: str | None = None):
    with get_conn() as conn:
        if status:
            rows = conn.execute(
                "SELECT * FROM approval_items WHERE status = ? ORDER BY requested_at DESC",
                (status,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM approval_items ORDER BY requested_at DESC",
            ).fetchall()
    return [dict(r) for r in rows]


@router.get("/{approval_id}", response_model=ApprovalItem)
def get_approval(approval_id: str):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM approval_items WHERE id = ?", (approval_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail=f"Approval {approval_id!r} not found")
    return dict(row)


@router.post("/{approval_id}/resolve", response_model=ApprovalItem)
def resolve_approval(approval_id: str, body: ApprovalResolve):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM approval_items WHERE id = ?", (approval_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Approval {approval_id!r} not found")

        ap = dict(row)

        # Operating law — RED/BLACK risk cannot be approved autonomously
        if ap["risk_level"] in ("red", "black") and body.resolved_by == "agent":
            raise HTTPException(
                status_code=403,
                detail="RED/BLACK risk approvals require primary operator authority, not agent.",
            )

        # Operating law — autonomous send/submit blocked
        if not settings.allow_autonomous_send and body.status == "approved":
            pass  # approval is recorded; actual send is a separate guarded action

        now = datetime.now(timezone.utc).isoformat()
        conn.execute(
            "UPDATE approval_items SET status = ?, resolved_at = ?, resolved_by = ? WHERE id = ?",
            (body.status, now, body.resolved_by, approval_id),
        )
        updated = conn.execute("SELECT * FROM approval_items WHERE id = ?", (approval_id,)).fetchone()

    log_event(
        f"Approval {body.status}", body.resolved_by,
        f"Approval {approval_id} ({ap['project_code']}) resolved as {body.status}",
        project_code=ap["project_code"],
        action_id=ap["action_id"],
    )
    return dict(updated)
