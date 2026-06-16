from datetime import datetime
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class CaseCreate(BaseModel):
    title: str = "交通事故案件"
    accident_time: datetime | None = None
    accident_location: str | None = None
    province: str | None = None
    city: str | None = None
    accident_type: str | None = None
    responsibility_type: str | None = None
    injury_level: str | None = None
    has_insurance: bool | None = None


class CaseOut(CaseCreate):
    id: UUID = Field(default_factory=uuid4)
    case_no: str
    user_id: UUID
    risk_level: str = "low"
    status: str = "intake"
    summary: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class IntakeAnswer(BaseModel):
    step: str
    answer: str


class IntakeSubmit(BaseModel):
    answers: list[IntakeAnswer]


class IntakeResult(BaseModel):
    case_id: UUID
    risk_level: str
    status: str
    next_action: str
    missing_materials: list[str]


class CaseStatusUpdate(BaseModel):
    status: str
