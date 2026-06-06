from datetime import datetime
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class UserBase(BaseModel):
    openid: str
    nickname: str | None = None
    phone_masked: str | None = None


class UserCreate(UserBase):
    pass


class UserOut(UserBase):
    id: UUID = Field(default_factory=uuid4)
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ConsentCreate(BaseModel):
    consent_type: str
    version: str


class ConsentOut(ConsentCreate):
    granted: bool = True
    granted_at: datetime = Field(default_factory=datetime.utcnow)

