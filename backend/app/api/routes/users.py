from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import User, UserConsent
from app.db.session import get_db
from app.schemas.users import ConsentCreate, ConsentOut, LoginOut, LoginRequest, UserCreate, UserOut
from app.services.users import UserService
from app.services.wechat import WeChatLoginError

router = APIRouter()


def to_user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        openid=user.openid,
        nickname=user.nickname,
        phone_masked=user.phone_masked,
        status=user.status,
        created_at=user.created_at,
    )


@router.post("/login", response_model=LoginOut)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginOut:
    try:
        token, user = UserService(db).login_with_wechat_code(
            code=payload.code,
            nickname=payload.nickname,
            phone_masked=payload.phone_masked,
        )
    except (WeChatLoginError, HTTPException) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    return LoginOut(access_token=token, user=to_user_out(user))


@router.post("", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserOut:
    user = UserService(db).create_or_get_user(
        openid=payload.openid,
        nickname=payload.nickname,
        phone_masked=payload.phone_masked,
    )
    return to_user_out(user)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)) -> UserOut:
    return to_user_out(current_user)


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
) -> UserOut:
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="forbidden")
    return to_user_out(current_user)


@router.post("/{user_id}/consents", response_model=ConsentOut)
def grant_consent(
    user_id: UUID,
    payload: ConsentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ConsentOut:
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="forbidden")

    consent = UserService(db).add_consent(
        user_id=current_user.id,
        consent_type=payload.consent_type,
        version=payload.version,
    )
    return ConsentOut(
        consent_type=consent.consent_type,
        version=consent.version,
        granted=True,
        granted_at=consent.granted_at,
    )
