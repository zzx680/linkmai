from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import Case


class CaseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_owned(self, case_id: UUID, user_id: UUID) -> Case | None:
        return self.db.query(Case).filter(Case.id == case_id, Case.user_id == user_id).one_or_none()

    def list_owned(self, user_id: UUID) -> list[Case]:
        return (
            self.db.query(Case)
            .filter(Case.user_id == user_id)
            .order_by(Case.created_at.desc())
            .all()
        )

    def create(self, case: Case) -> Case:
        self.db.add(case)
        self.db.flush()
        return case
