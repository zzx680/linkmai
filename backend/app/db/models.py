from datetime import datetime, timezone
from uuid import uuid4

from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    openid: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    unionid: Mapped[str | None] = mapped_column(String(128))
    phone_encrypted: Mapped[str | None] = mapped_column(Text)
    phone_hash: Mapped[str | None] = mapped_column(String(128))
    nickname: Mapped[str | None] = mapped_column(String(128))
    avatar_url: Mapped[str | None] = mapped_column(Text)
    phone_masked: Mapped[str | None] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    cases: Mapped[list["Case"]] = relationship(back_populates="user")


class UserConsent(Base):
    __tablename__ = "user_consents"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    consent_type: Mapped[str] = mapped_column(String(64), nullable=False)
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    granted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ip: Mapped[str | None] = mapped_column(String(64))


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    case_no: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    accident_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    accident_location: Mapped[str | None] = mapped_column(Text)
    province: Mapped[str | None] = mapped_column(String(64))
    city: Mapped[str | None] = mapped_column(String(64))
    accident_type: Mapped[str | None] = mapped_column(String(64))
    responsibility_type: Mapped[str | None] = mapped_column(String(64))
    injury_level: Mapped[str | None] = mapped_column(String(64))
    has_insurance: Mapped[bool | None] = mapped_column(Boolean)
    risk_level: Mapped[str] = mapped_column(String(32), default="low", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="intake", nullable=False)
    summary: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    user: Mapped[User] = relationship(back_populates="cases")
    parties: Mapped[list["CaseParty"]] = relationship(back_populates="case")
    materials: Mapped[list["Material"]] = relationship(back_populates="case")
    claim_reports: Mapped[list["ClaimReport"]] = relationship(back_populates="case")
    documents: Mapped[list["Document"]] = relationship(back_populates="case")
    orders: Mapped[list["Order"]] = relationship(back_populates="case")


class CaseParty(Base):
    __tablename__ = "case_parties"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    case_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("cases.id"), nullable=False, index=True)
    party_type: Mapped[str] = mapped_column(String(32), nullable=False)
    name_encrypted: Mapped[str | None] = mapped_column(Text)
    phone_encrypted: Mapped[str | None] = mapped_column(Text)
    vehicle_plate_encrypted: Mapped[str | None] = mapped_column(Text)
    insurer_name: Mapped[str | None] = mapped_column(String(128))
    policy_no_encrypted: Mapped[str | None] = mapped_column(Text)

    case: Mapped[Case] = relationship(back_populates="parties")


class Material(Base):
    __tablename__ = "materials"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    case_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("cases.id"), nullable=False, index=True)
    user_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    material_type: Mapped[str] = mapped_column(String(64), nullable=False)
    file_id: Mapped[object | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("files.id"))
    status: Mapped[str] = mapped_column(String(32), default="uploaded", nullable=False)
    ocr_result_json: Mapped[dict | None] = mapped_column(JSON)
    reviewer_id: Mapped[object | None] = mapped_column(Uuid(as_uuid=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    case: Mapped[Case] = relationship(back_populates="materials")


class File(Base):
    __tablename__ = "files"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    owner_user_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    case_id: Mapped[object | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("cases.id"))
    bucket: Mapped[str] = mapped_column(String(128), nullable=False)
    object_key: Mapped[str] = mapped_column(Text, nullable=False)
    file_name: Mapped[str] = mapped_column(Text, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(128), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=False)
    sha256: Mapped[str | None] = mapped_column(String(128))
    encryption_key_id: Mapped[str | None] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class ClaimReport(Base):
    __tablename__ = "claim_reports"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    case_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("cases.id"), nullable=False, index=True)
    user_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    total_estimated_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    confidence_level: Mapped[str | None] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(32), default="draft", nullable=False)
    calculation_input_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    calculation_output_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    rule_version: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    case: Mapped[Case] = relationship(back_populates="claim_reports")
    items: Mapped[list["ClaimItem"]] = relationship(back_populates="report")


class ClaimItem(Base):
    __tablename__ = "claim_items"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    report_id: Mapped[object] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("claim_reports.id"), nullable=False, index=True
    )
    item_type: Mapped[str] = mapped_column(String(64), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    formula: Mapped[str | None] = mapped_column(Text)
    evidence_status: Mapped[str | None] = mapped_column(String(32))
    basis_text: Mapped[str | None] = mapped_column(Text)
    missing_materials_json: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    report: Mapped[ClaimReport] = relationship(back_populates="items")


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    case_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("cases.id"), nullable=False, index=True)
    user_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    document_type: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content_redacted: Mapped[str | None] = mapped_column(Text)
    file_id: Mapped[object | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("files.id"))
    ai_run_id: Mapped[object | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("ai_runs.id"))
    status: Mapped[str] = mapped_column(String(32), default="draft", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    case: Mapped[Case] = relationship(back_populates="documents")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    sku: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    entitlement_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)

    orders: Mapped[list["Order"]] = relationship(back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    case_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("cases.id"), nullable=False, index=True)
    order_no: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    product_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("products.id"), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    case: Mapped[Case] = relationship(back_populates="orders")
    product: Mapped[Product] = relationship(back_populates="orders")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    order_id: Mapped[object] = mapped_column(Uuid(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True)
    provider: Mapped[str] = mapped_column(String(32), default="wechat_pay", nullable=False)
    prepay_id: Mapped[str | None] = mapped_column(String(128))
    transaction_id: Mapped[str | None] = mapped_column(String(128))
    out_trade_no: Mapped[str | None] = mapped_column(String(64))
    callback_payload_json: Mapped[dict | None] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class AIRun(Base):
    __tablename__ = "ai_runs"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    case_id: Mapped[object | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("cases.id"))
    user_id: Mapped[object | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"))
    agent_type: Mapped[str] = mapped_column(String(64), nullable=False)
    model: Mapped[str | None] = mapped_column(String(128))
    prompt_version: Mapped[str | None] = mapped_column(String(64))
    input_redacted: Mapped[str | None] = mapped_column(Text)
    output_redacted: Mapped[str | None] = mapped_column(Text)
    tool_calls_json: Mapped[dict | None] = mapped_column(JSON)
    token_usage_json: Mapped[dict | None] = mapped_column(JSON)
    latency_ms: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(32), default="ok", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[object] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    actor_type: Mapped[str] = mapped_column(String(32), nullable=False)
    actor_id: Mapped[object | None] = mapped_column(Uuid(as_uuid=True))
    action: Mapped[str] = mapped_column(String(64), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(64), nullable=False)
    resource_id: Mapped[object | None] = mapped_column(Uuid(as_uuid=True))
    before_json: Mapped[dict | None] = mapped_column(JSON)
    after_json: Mapped[dict | None] = mapped_column(JSON)
    ip: Mapped[str | None] = mapped_column(String(64))
    user_agent: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
