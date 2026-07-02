from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Order, Product, User
from app.db.session import get_db
from app.schemas.orders import OrderCreate, OrderOut, PayOut, ProductOut
from app.services.orders import OrderService

router = APIRouter()


def to_product_out(product: Product) -> ProductOut:
    return ProductOut(
        id=str(product.id),
        sku=product.sku,
        name=product.name,
        price=product.price,
        entitlement=product.entitlement_json,
    )


def to_order_out(order: Order) -> OrderOut:
    return OrderOut(
        id=order.id,
        order_no=order.order_no,
        case_id=order.case_id,
        product_sku=order.product.sku,
        amount=order.amount,
        status=order.status,
        created_at=order.created_at,
    )


@router.get("/products", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)) -> list[ProductOut]:
    products = OrderService(db).list_products()
    return [to_product_out(product) for product in products]


@router.post("", response_model=OrderOut)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrderOut:
    order = OrderService(db).create_order(payload, current_user)
    return to_order_out(order)


@router.post("/{order_id}/pay", response_model=PayOut)
def create_payment(
    order_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PayOut:
    payment = OrderService(db).create_mock_payment(order_id, current_user)
    return PayOut(
        timeStamp="1760000000",
        nonceStr="mock-nonce",
        package=f"prepay_id={payment.prepay_id}",
        paySign="mock-pay-sign",
    )
