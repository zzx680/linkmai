from uuid import UUID, uuid4

from fastapi import APIRouter

from app.schemas.cases import CaseCreate, CaseOut, IntakeResult, IntakeSubmit

router = APIRouter()

MOCK_USER_ID = UUID("00000000-0000-0000-0000-000000000001")


@router.get("", response_model=list[CaseOut])
def list_cases() -> list[CaseOut]:
    return [
        CaseOut(
            id=UUID("10000000-0000-0000-0000-000000000001"),
            user_id=MOCK_USER_ID,
            case_no="LM202606060001",
            title="追尾事故 · 上海浦东",
            accident_location="上海浦东",
            risk_level="medium",
            status="pending_material",
            summary="责任已认定，对方全责，当前缺少医疗发票和病历。",
        )
    ]


@router.post("", response_model=CaseOut)
def create_case(payload: CaseCreate) -> CaseOut:
    return CaseOut(
        id=uuid4(),
        user_id=MOCK_USER_ID,
        case_no="LM202606060002",
        **payload.model_dump(),
    )


@router.get("/{case_id}", response_model=CaseOut)
def get_case(case_id: UUID) -> CaseOut:
    return CaseOut(
        id=case_id,
        user_id=MOCK_USER_ID,
        case_no="LM202606060001",
        title="追尾事故 · 上海浦东",
        accident_location="上海浦东",
        risk_level="medium",
        status="pending_material",
        summary="当前案件存在材料不确定项，建议补充医疗发票、收入证明和护理天数。",
    )


@router.post("/{case_id}/intake", response_model=IntakeResult)
def submit_intake(case_id: UUID, payload: IntakeSubmit) -> IntakeResult:
    high_risk_answers = {"伤情较重", "无保险", "对方拒绝提供"}
    answers = {item.answer for item in payload.answers}
    high_risk = bool(answers.intersection(high_risk_answers))

    return IntakeResult(
        case_id=case_id,
        risk_level="high" if high_risk else "medium",
        status="manual_review" if high_risk else "pending_material",
        next_action="申请人工复核" if high_risk else "上传医疗发票和病历",
        missing_materials=["医疗发票", "病历", "收入证明", "护理天数说明"],
    )

