from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ClaimItemOut(BaseModel):
    item_type: str
    amount: float
    formula: str
    evidence_status: str
    basis_text: str
    missing_materials: list[str] = Field(default_factory=list)


class ClaimReportOut(BaseModel):
    id: UUID
    case_id: UUID
    version: int
    rule_version: str
    total_min: float
    total_max: float
    total_estimated_amount: float
    confidence_level: str
    status: str
    items: list[ClaimItemOut]
    uncertainties: list[str]
    created_at: datetime
