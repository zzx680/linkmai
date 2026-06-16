from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.users import LoginOut, LoginRequest
from app.services.users import UserService
from app.services.wechat import WeChatLoginError
from app.api.routes.users import to_user_out

router = APIRouter()


@router.post("/wechat-login", response_model=LoginOut)
def wechat_login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginOut:
    try:
        token, user = UserService(db).login_with_wechat_code(
            code=payload.code,
            nickname=payload.nickname,
            phone_masked=payload.phone_masked,
        )
    except WeChatLoginError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return LoginOut(access_token=token, user=to_user_out(user))
