from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import ClaimItem, ClaimReport


class ClaimRepository:
    def __init__(self, db: Session):
        self.db = db

    def latest_for_case(self, case_id: UUID, user_id: UUID) -> ClaimReport | None:
        return (
            self.db.query(ClaimReport)
            .filter(ClaimReport.case_id == case_id, ClaimReport.user_id == user_id)
            .order_by(ClaimReport.version.desc(), ClaimReport.created_at.desc())
            .first()
        )

    def next_version(self, case_id: UUID, user_id: UUID) -> int:
        latest = self.latest_for_case(case_id, user_id)
        return 1 if latest is None else latest.version + 1

    def create_report(self, report: ClaimReport, items: list[ClaimItem]) -> ClaimReport:
        self.db.add(report)
        self.db.flush()
        for item in items:
            item.report_id = report.id
            self.db.add(item)
        self.db.flush()
        return report
