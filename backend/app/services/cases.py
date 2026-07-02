from datetime import datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import Case, User
from app.repositories.cases import CaseRepository
from app.schemas.cases import CaseCreate, IntakeSubmit


HIGH_RISK_KEYWORDS = {
    "死亡",
    "重伤",
    "酒驾",
    "逃逸",
    "无保险",
    "对方拒赔",
    "责任严重争议",
}


class CaseService:
    def __init__(self, db: Session):
        self.db = db
        self.cases = CaseRepository(db)

    def list_cases(self, user: User) -> list[Case]:
        return self.cases.list_owned(user.id)

    def get_case(self, case_id: UUID, user: User) -> Case:
        case = self.cases.get_owned(case_id, user.id)
        if case is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="case not found")
        return case

    def create_case(self, payload: CaseCreate, user: User) -> Case:
        case = Case(
            user_id=user.id,
            case_no=self._build_case_no(),
            **payload.model_dump(),
        )
        self.cases.create(case)
        self.db.commit()
        self.db.refresh(case)
        return case

    def submit_intake(self, case_id: UUID, payload: IntakeSubmit, user: User) -> dict:
        case = self.get_case(case_id, user)
        answers = {item.answer for item in payload.answers}
        high_risk = self._is_high_risk(answers, case)
        missing_materials = ["医疗发票", "病历", "收入证明", "护理天数说明"]

        case.risk_level = "high" if high_risk else "medium"
        case.status = "manual_review" if high_risk else "pending_material"
        case.summary = (
            "案件触发高风险规则，建议转人工复核。"
            if high_risk
            else "当前案件建议补充医疗发票、病历、收入证明和护理天数说明。"
        )
        self.db.commit()

        return {
            "case_id": case.id,
            "risk_level": case.risk_level,
            "status": case.status,
            "next_action": "转人工复核" if high_risk else "上传医疗发票和病历",
            "missing_materials": missing_materials,
        }

    def update_status(self, case_id: UUID, status_value: str, user: User) -> Case:
        case = self.get_case(case_id, user)
        case.status = status_value
        self.db.commit()
        self.db.refresh(case)
        return case

    @staticmethod
    def _build_case_no() -> str:
        return f"LM{datetime.utcnow():%Y%m%d%H%M%S%f}"

    @staticmethod
    def _is_high_risk(answers: set[str], case: Case) -> bool:
        values = {
            item
            for item in [
                case.accident_type,
                case.responsibility_type,
                case.injury_level,
                "无保险" if case.has_insurance is False else None,
                *answers,
            ]
            if item
        }
        joined = " ".join(values)
        return any(keyword in joined for keyword in HIGH_RISK_KEYWORDS)
