from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DocumentGenerateRequest(BaseModel):
    document_type: str


class DocumentOut(BaseModel):
    id: UUID
    case_id: UUID
    document_type: str
    title: str
    content_redacted: str
    status: str
    created_at: datetime
