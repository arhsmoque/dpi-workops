from datetime import datetime
from pydantic import BaseModel


class AuditEventCreate(BaseModel):
    id: str
    event: str
    actor: str
    project_code: str | None = None
    action_id: str | None = None
    detail: str
    source: str | None = None


class AuditEvent(AuditEventCreate):
    timestamp: datetime

    model_config = {"from_attributes": True}
