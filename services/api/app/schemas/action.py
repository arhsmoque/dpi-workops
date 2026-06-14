from datetime import date, datetime
from pydantic import BaseModel
from .common import RiskLevel, ActionStatus, SourceType


class SourceItemIn(BaseModel):
    source_type: SourceType
    label: str
    item_date: date
    href: str | None = None
    is_primary: bool = False


class SourceItemOut(SourceItemIn):
    id: int
    sort_order: int


class ActionCardCreate(BaseModel):
    id: str
    project_code: str
    title: str
    risk_level: RiskLevel = "blue"
    action_type: str
    status: ActionStatus = "pending-review"
    priority: int = 3
    due_date: date | None = None
    next_step: str
    authority_text: str
    ai_generated: bool = False
    summary: str | None = None
    ai_reason: str | None = None
    source_items: list[SourceItemIn] = []
    missing_info: list[str] = []


class ActionStatusUpdate(BaseModel):
    status: ActionStatus


class ActionCard(ActionCardCreate):
    source_items: list[SourceItemOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
