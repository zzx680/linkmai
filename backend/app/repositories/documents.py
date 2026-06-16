from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import Document


class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, document: Document) -> Document:
        self.db.add(document)
        self.db.flush()
        return document

    def list_for_case(self, case_id: UUID, user_id: UUID) -> list[Document]:
        return (
            self.db.query(Document)
            .filter(Document.case_id == case_id, Document.user_id == user_id)
            .order_by(Document.created_at.desc())
            .all()
        )
