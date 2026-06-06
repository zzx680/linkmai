from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException

from app.schemas.orders import OrderCreate, OrderOut, PayOut, ProductOut

router = APIRouter()

PRODUCTS = {
    "report": ProductOut(
        id="prod_report",
        sku="report",
        name="测算报告",
        price=2900,
        entitlement={"report": True},
    ),
    "claim_pack": ProductOut(
        id="prod_claim_pack",
        sku="claim_pack",
        name="理赔材料包",
        price=8900,
        entitlement={"report": True, "documents": ["claim_letter", "evidence_list"]},
    ),
    "manual_review": ProductOut(
        id="prod_manual_review",
        sku="manual_review",
        name="人工复核",
        price=29900,
        entitlement={"manual_review": True},
    ),
}


@router.get("/products", response_model=list[ProductOut])
def list_products() -> list[ProductOut]:
    return list(PRODUCTS.values())


@router.post("", response_model=OrderOut)
def create_order(payload: OrderCreate) -> OrderOut:
    product = PRODUCTS.get(payload.product_sku)
    if not product:
        raise HTTPException(status_code=404, detail="product not found")

    return OrderOut(
        id=uuid4(),
        order_no="LMO202606060001",
        case_id=payload.case_id,
        product_sku=payload.product_sku,
        amount=product.price,
    )


@router.post("/{order_id}/pay", response_model=PayOut)
def create_payment(order_id: UUID) -> PayOut:
    return PayOut(
        timeStamp="1760000000",
        nonceStr="mock-nonce",
        package="prepay_id=mock-prepay-id",
        paySign="mock-pay-sign",
    )

