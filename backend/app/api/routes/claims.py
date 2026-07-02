from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import User
from app.db.session import get_db
from app.schemas.claims import ClaimReportOut
from app.services.claims import ClaimService

router = APIRouter()


@router.post("/cases/{case_id}/report", response_model=ClaimReportOut)
def calculate_report(
    case_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClaimReportOut:
    service = ClaimService(db)
    report = service.calculate_report(case_id, current_user)
    return ClaimReportOut(**service.to_output(report))
