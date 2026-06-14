from datetime import datetime, timezone
from fastapi import APIRouter
from app.config import settings
from app.database import get_conn

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    try:
        with get_conn() as conn:
            row = conn.execute("SELECT COUNT(*) as projects FROM projects").fetchone()
            db_status = "ok"
            project_count = row["projects"]
    except Exception as exc:
        db_status = f"error: {exc}"
        project_count = 0

    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "db": db_status,
        "projects_loaded": project_count,
        "autonomous_send": settings.allow_autonomous_send,
        "autonomous_submit": settings.allow_autonomous_submit,
    }
