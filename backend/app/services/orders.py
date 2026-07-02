from uuid import UUID, uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import Order, Payment, Product, User
from app.repositories.orders import OrderRepository
from app.schemas.orders import OrderCreate
from app.services.cases import CaseService


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.orders = OrderRepository(db)
        self.cases = CaseService(db)

    def list_products(self) -> list[Product]:
        return self.orders.list_products()

    def create_order(self, payload: OrderCreate, user: User) -> Order:
        self.cases.get_case(payload.case_id, user)
        product = self.orders.get_product_by_sku(payload.product_sku)
        if product is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="product not found")
        order = Order(
            user_id=user.id,
            case_id=payload.case_id,
            product_id=product.id,
            order_no=self._build_order_no(),
            amount=product.price,
        )
        self.orders.create_order(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def create_mock_payment(self, order_id: UUID, user: User) -> Payment:
        order = self.orders.get_owned_order(order_id, user.id)
        if order is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="order not found")
        payment = Payment(
            order_id=order.id,
            prepay_id=f"mock-prepay-{order.order_no}",
            out_trade_no=order.order_no,
            callback_payload_json={"entitlement_placeholder": True},
        )
        self.orders.create_payment(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment

    @staticmethod
    def _build_order_no() -> str:
        return f"LMO{uuid4().hex[:16].upper()}"
