from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import Order, Payment, Product


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_products(self) -> list[Product]:
        return (
            self.db.query(Product)
            .filter(Product.status == "active")
            .order_by(Product.price.asc())
            .all()
        )

    def get_product_by_sku(self, sku: str) -> Product | None:
        return self.db.query(Product).filter(Product.sku == sku, Product.status == "active").one_or_none()

    def create_order(self, order: Order) -> Order:
        self.db.add(order)
        self.db.flush()
        return order

    def get_owned_order(self, order_id: UUID, user_id: UUID) -> Order | None:
        return self.db.query(Order).filter(Order.id == order_id, Order.user_id == user_id).one_or_none()

    def create_payment(self, payment: Payment) -> Payment:
        self.db.add(payment)
        self.db.flush()
        return payment
