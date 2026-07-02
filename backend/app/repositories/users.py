from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import User, UserConsent


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, user_id: UUID) -> User | None:
        return self.db.get(User, user_id)

    def get_by_openid(self, openid: str) -> User | None:
        return self.db.query(User).filter(User.openid == openid).one_or_none()

    def create(self, openid: str, nickname: str | None = None, phone_masked: str | None = None) -> User:
        user = User(openid=openid, nickname=nickname, phone_masked=phone_masked)
        self.db.add(user)
        self.db.flush()
        return user

    def add_consent(self, user_id: UUID, consent_type: str, version: str) -> UserConsent:
        consent = UserConsent(user_id=user_id, consent_type=consent_type, version=version)
        self.db.add(consent)
        self.db.flush()
        return consent
