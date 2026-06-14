from typing import Literal
from pydantic import BaseModel

RiskLevel = Literal["green", "blue", "amber", "red", "black"]

ActionStatus = Literal[
    "pending-review", "in-review", "pending-approval",
    "approved", "rejected", "snoozed", "closed",
]

SourceType = Literal[
    "Gmail", "Drive", "Calendar", "Attachment",
    "Local File", "Report", "Audit", "Manual Note",
]

AllowedMode = Literal["desktop-only", "phone-allowed", "blocked"]
ApprovalStatus = Literal["pending", "approved", "rejected", "snoozed"]
