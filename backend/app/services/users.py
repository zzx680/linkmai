from uuid import UUID

from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.db.models import User, UserConsent
from app.repositories.users import UserRepository
from app.services.wechat import exchange_code_for_openid


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)

    def login_with_wechat_code(
        self,
        code: str,
        nickname: str | None = None,
        phone_masked: str | None = None,
    ) -> tuple[str, User]:
        openid = exchange_code_for_openid(code)
        user = self.users.get_by_openid(openid)
        if user is None:
            user = self.users.create(openid=openid, nickname=nickname, phone_masked=phone_masked)
        else:
            if nickname is not None:
                user.nickname = nickname
            if phone_masked is not None:
                user.phone_masked = phone_masked
        self.db.commit()
        self.db.refresh(user)
        return create_access_token(user.id), user

    def create_or_get_user(self, openid: str, nickname: str | None = None, phone_masked: str | None = None) -> User:
        user = self.users.get_by_openid(openid)
        if user is None:
            user = self.users.create(openid=openid, nickname=nickname, phone_masked=phone_masked)
            self.db.commit()
            self.db.refresh(user)
        return user

    def add_consent(self, user_id: UUID, consent_type: str, version: str) -> UserConsent:
        consent = self.users.add_consent(user_id, consent_type, version)
        self.db.commit()
        self.db.refresh(consent)
        return consent
