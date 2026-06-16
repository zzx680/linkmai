from datetime import datetime
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class UploadTokenRequest(BaseModel):
    case_id: UUID
    material_type: str
    file_name: str
    mime_type: str
    size: int


class UploadTokenOut(BaseModel):
    upload_url: str
    object_key: str
    file_id: UUID
    expires_in: int = 900


class MaterialCreate(BaseModel):
    case_id: UUID
    material_type: str
    file_id: UUID | None = None


class MaterialOut(MaterialCreate):
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    status: str = "uploaded"
    ocr_result: dict | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MaterialVerify(BaseModel):
    status: str
    corrected_fields: dict | None = None
