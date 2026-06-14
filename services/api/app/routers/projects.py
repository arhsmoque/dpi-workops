from fastapi import APIRouter, HTTPException
from app.database import get_conn
from app.schemas.project import Project, ProjectSummary, ProjectCreate
from app.services.audit_logger import log_event

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _row_to_project(row) -> dict:
    return dict(row)


@router.get("", response_model=list[ProjectSummary])
def list_projects():
    with get_conn() as conn:
        rows = conn.execute("""
            SELECT
                p.code, p.name, p.client, p.risk_level, p.next_meeting, p.last_activity,
                (SELECT COUNT(*) FROM action_cards a WHERE a.project_code = p.code
                 AND a.status NOT IN ('closed','approved','rejected')) AS open_actions,
                (SELECT COUNT(*) FROM approval_items ap WHERE ap.project_code = p.code
                 AND ap.status = 'pending') AS pending_approvals,
                (SELECT COUNT(*) FROM action_cards a WHERE a.project_code = p.code
                 AND a.action_type LIKE '%Submission%'
                 AND a.status NOT IN ('closed','approved')) AS pending_submissions
            FROM projects p
            ORDER BY
                CASE p.risk_level WHEN 'red' THEN 0 WHEN 'black' THEN 1
                    WHEN 'amber' THEN 2 WHEN 'blue' THEN 3 ELSE 4 END,
                p.last_activity DESC
        """).fetchall()
    return [dict(r) for r in rows]


@router.get("/{code}", response_model=Project)
def get_project(code: str):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM projects WHERE code = ?", (code,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail=f"Project {code!r} not found")
    return dict(row)


@router.post("", response_model=Project, status_code=201)
def create_project(body: ProjectCreate):
    with get_conn() as conn:
        existing = conn.execute("SELECT code FROM projects WHERE code = ?", (body.code,)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail=f"Project {body.code!r} already exists")
        conn.execute(
            """INSERT INTO projects (code, name, client, risk_level, description, next_meeting)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (body.code, body.name, body.client, body.risk_level,
             body.description, str(body.next_meeting) if body.next_meeting else None),
        )
        row = conn.execute("SELECT * FROM projects WHERE code = ?", (body.code,)).fetchone()
    log_event("Project created", "api", f"Project {body.code} — {body.name} created",
              project_code=body.code)
    return dict(row)
