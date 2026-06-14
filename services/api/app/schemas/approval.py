from datetime import datetime
from pydantic import BaseModel
from .common import RiskLevel, AllowedMode, ApprovalStatus


class ApprovalResolve(BaseModel):
    status: ApprovalStatus
    resolved_by: str = "primary-operator"


class ApprovalItem(BaseModel):
    id: str
    action_id: str
    project_code: str
    proposed_action: str
    consequence: str
    risk_level: RiskLevel
    allowed_mode: AllowedMode
    status: ApprovalStatus
    requested_at: datetime
    resolved_at: datetime | None = None
    resolved_by: str | None = None

    model_config = {"from_attributes": True}
