import uuid
from fastapi import APIRouter, HTTPException, Query
from app.database import get_conn
from app.schemas.action import ActionCard, ActionCardCreate, ActionStatusUpdate
from app.services.audit_logger import log_event

router = APIRouter(prefix="/api/actions", tags=["actions"])


def _build_action(conn, row) -> dict:
    d = dict(row)
    sources = conn.execute(
        "SELECT * FROM source_items WHERE action_id = ? ORDER BY sort_order",
        (d["id"],),
    ).fetchall()
    missing = conn.execute(
        "SELECT description FROM missing_info WHERE action_id = ? ORDER BY sort_order",
        (d["id"],),
    ).fetchall()
    d["source_items"] = [dict(s) for s in sources]
    d["missing_info"] = [m["description"] for m in missing]
    return d


@router.get("", response_model=list[ActionCard])
def list_actions(
    project_code: str | None = Query(None),
    risk_level: str | None = Query(None),
    status: str | None = Query(None),
):
    clauses = []
    params: list = []
    if project_code:
        clauses.append("a.project_code = ?")
        params.append(project_code)
    if risk_level:
        clauses.append("a.risk_level = ?")
        params.append(risk_level)
    if status:
        clauses.append("a.status = ?")
        params.append(status)
    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""

    with get_conn() as conn:
        rows = conn.execute(
            f"""SELECT * FROM action_cards a {where}
                ORDER BY
                    CASE a.risk_level WHEN 'red' THEN 0 WHEN 'black' THEN 1
                        WHEN 'amber' THEN 2 WHEN 'blue' THEN 3 ELSE 4 END,
                    a.priority, a.due_date NULLS LAST""",
            params,
        ).fetchall()
        return [_build_action(conn, r) for r in rows]


@router.get("/{action_id}", response_model=ActionCard)
def get_action(action_id: str):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM action_cards WHERE id = ?", (action_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Action {action_id!r} not found")
        return _build_action(conn, row)


@router.patch("/{action_id}/status", response_model=ActionCard)
def update_action_status(action_id: str, body: ActionStatusUpdate):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM action_cards WHERE id = ?", (action_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Action {action_id!r} not found")
        conn.execute(
            "UPDATE action_cards SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (body.status, action_id),
        )
        updated = conn.execute("SELECT * FROM action_cards WHERE id = ?", (action_id,)).fetchone()
        result = _build_action(conn, updated)

    log_event(
        "Action status updated", "api",
        f"Action {action_id} status → {body.status}",
        project_code=dict(row)["project_code"],
        action_id=action_id,
    )
    return result


@router.post("", response_model=ActionCard, status_code=201)
def create_action(body: ActionCardCreate):
    with get_conn() as conn:
        existing = conn.execute("SELECT id FROM action_cards WHERE id = ?", (body.id,)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail=f"Action {body.id!r} already exists")
        conn.execute(
            """INSERT INTO action_cards
               (id, project_code, title, risk_level, action_type, status, priority,
                due_date, next_step, authority_text, ai_generated, summary, ai_reason)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (body.id, body.project_code, body.title, body.risk_level, body.action_type,
             body.status, body.priority,
             str(body.due_date) if body.due_date else None,
             body.next_step, body.authority_text,
             body.ai_generated, body.summary, body.ai_reason),
        )
        for i, s in enumerate(body.source_items):
            conn.execute(
                "INSERT INTO source_items (action_id, source_type, label, item_date, href, is_primary, sort_order) VALUES (?,?,?,?,?,?,?)",
                (body.id, s.source_type, s.label, str(s.item_date), s.href, s.is_primary, i),
            )
        for i, m in enumerate(body.missing_info):
            conn.execute(
                "INSERT INTO missing_info (action_id, description, sort_order) VALUES (?,?,?)",
                (body.id, m, i),
            )
        row = conn.execute("SELECT * FROM action_cards WHERE id = ?", (body.id,)).fetchone()
        result = _build_action(conn, row)

    log_event("Action card created", "api", f"Action {body.id} — {body.title[:60]}",
              project_code=body.project_code, action_id=body.id)
    return result
