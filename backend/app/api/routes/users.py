from uuid import UUID, uuid4

from fastapi import APIRouter

from app.schemas.users import ConsentCreate, ConsentOut, UserCreate, UserOut

router = APIRouter()


@router.post("", response_model=UserOut)
def create_user(payload: UserCreate) -> UserOut:
    return UserOut(
        id=uuid4(),
        openid=payload.openid,
        nickname=payload.nickname,
        phone_masked=payload.phone_masked,
    )


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: UUID) -> UserOut:
    return UserOut(
        id=user_id,
        openid="mock-openid",
        nickname="微信用户",
        phone_masked="138****0000",
    )


@router.post("/{user_id}/consents", response_model=ConsentOut)
def grant_consent(user_id: UUID, payload: ConsentCreate) -> ConsentOut:
    return ConsentOut(
        consent_type=payload.consent_type,
        version=payload.version,
    )

