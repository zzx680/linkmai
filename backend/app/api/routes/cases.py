from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Case, User
from app.db.session import get_db
from app.schemas.cases import CaseCreate, CaseOut, CaseStatusUpdate, IntakeResult, IntakeSubmit
from app.services.cases import CaseService

router = APIRouter()


def to_case_out(case: Case) -> CaseOut:
    return CaseOut(
        id=case.id,
        user_id=case.user_id,
        case_no=case.case_no,
        title=case.title,
        accident_time=case.accident_time,
        accident_location=case.accident_location,
        province=case.province,
        city=case.city,
        accident_type=case.accident_type,
        responsibility_type=case.responsibility_type,
        injury_level=case.injury_level,
        has_insurance=case.has_insurance,
        risk_level=case.risk_level,
        status=case.status,
        summary=case.summary,
        created_at=case.created_at,
        updated_at=case.updated_at,
    )


@router.get("", response_model=list[CaseOut])
def list_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[CaseOut]:
    cases = CaseService(db).list_cases(current_user)
    return [to_case_out(case) for case in cases]


@router.post("", response_model=CaseOut)
def create_case(
    payload: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CaseOut:
    case = CaseService(db).create_case(payload, current_user)
    return to_case_out(case)


@router.get("/{case_id}", response_model=CaseOut)
def get_case(
    case_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CaseOut:
    return to_case_out(CaseService(db).get_case(case_id, current_user))


@router.patch("/{case_id}/status", response_model=CaseOut)
def update_case_status(
    case_id: UUID,
    payload: CaseStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CaseOut:
    return to_case_out(CaseService(db).update_status(case_id, payload.status, current_user))


@router.post("/{case_id}/intake", response_model=IntakeResult)
def submit_intake(
    case_id: UUID,
    payload: IntakeSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> IntakeResult:
    return IntakeResult(**CaseService(db).submit_intake(case_id, payload, current_user))
