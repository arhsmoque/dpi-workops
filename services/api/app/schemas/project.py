from datetime import date, datetime
from pydantic import BaseModel
from .common import RiskLevel


class ProjectBase(BaseModel):
    code: str
    name: str
    client: str
    risk_level: RiskLevel = "green"
    description: str | None = None
    next_meeting: date | None = None


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    last_activity: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectSummary(BaseModel):
    code: str
    name: str
    client: str
    risk_level: RiskLevel
    open_actions: int = 0
    pending_approvals: int = 0
    pending_submissions: int = 0
    next_meeting: date | None = None
    last_activity: datetime
