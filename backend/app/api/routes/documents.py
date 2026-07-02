from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Document, User
from app.db.session import get_db
from app.schemas.documents import DocumentGenerateRequest, DocumentOut
from app.services.documents import DocumentService

router = APIRouter()


def to_document_out(document: Document) -> DocumentOut:
    return DocumentOut(
        id=document.id,
        case_id=document.case_id,
        document_type=document.document_type,
        title=document.title,
        content_redacted=document.content_redacted or "",
        status=document.status,
        created_at=document.created_at,
    )


@router.post("/cases/{case_id}", response_model=DocumentOut)
def generate_document(
    case_id: UUID,
    payload: DocumentGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentOut:
    document = DocumentService(db).generate_document(case_id, payload.document_type, current_user)
    return to_document_out(document)


@router.get("/cases/{case_id}", response_model=list[DocumentOut])
def list_documents(
    case_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[DocumentOut]:
    documents = DocumentService(db).list_case_documents(case_id, current_user)
    return [to_document_out(document) for document in documents]
