from datetime import datetime
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class ProductOut(BaseModel):
    id: str
    sku: str
    name: str
    price: int
    currency: str = "CNY"
    entitlement: dict


class OrderCreate(BaseModel):
    case_id: UUID
    product_sku: str


class OrderOut(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    order_no: str
    case_id: UUID
    product_sku: str
    amount: int
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PayRequest(BaseModel):
    order_id: UUID


class PayOut(BaseModel):
    timeStamp: str
    nonceStr: str
    package: str
    signType: str = "RSA"
    paySign: str

