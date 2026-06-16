from sqlalchemy.orm import Session

from app.db import models
from app.db.session import Base, engine


DEFAULT_PRODUCTS = [
    {
        "sku": "report",
        "name": "测算报告",
        "price": 2900,
        "entitlement_json": {"report": True},
    },
    {
        "sku": "claim_pack",
        "name": "理赔材料包",
        "price": 8900,
        "entitlement_json": {"report": True, "documents": ["claim_letter", "evidence_list"]},
    },
    {
        "sku": "manual_review",
        "name": "人工复核",
        "price": 29900,
        "entitlement_json": {"manual_review": True},
    },
]


def create_db_and_tables() -> None:
    Base.metadata.create_all(bind=engine)


def seed_products(db: Session) -> None:
    for product_data in DEFAULT_PRODUCTS:
        product = db.query(models.Product).filter(models.Product.sku == product_data["sku"]).one_or_none()
        if product:
            product.name = product_data["name"]
            product.price = product_data["price"]
            product.entitlement_json = product_data["entitlement_json"]
            product.status = "active"
        else:
            db.add(models.Product(**product_data))
    db.commit()


def init_db() -> None:
    create_db_and_tables()
    with Session(engine) as db:
        seed_products(db)
