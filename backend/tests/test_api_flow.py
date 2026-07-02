from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.db.init import seed_products
from app.db.models import Base
from app.main import create_app


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        seed_products(db)

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app = create_app(init_database=False)
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client


def login(client: TestClient, code: str = "dev-user-1") -> tuple[str, dict]:
    response = client.post(
        "/api/v1/auth/wechat-login",
        json={"code": code, "nickname": "测试用户", "phone_masked": "138****0000"},
    )
    assert response.status_code == 200
    data = response.json()
    return data["access_token"], data["user"]


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_login_me_case_material_order_flow(client: TestClient) -> None:
    token, user = login(client)

    me_response = client.get("/api/v1/users/me", headers=auth_header(token))
    assert me_response.status_code == 200
    assert me_response.json()["id"] == user["id"]

    case_response = client.post(
        "/api/v1/cases",
        headers=auth_header(token),
        json={"title": "追尾事故", "accident_location": "上海浦东"},
    )
    assert case_response.status_code == 200
    case = case_response.json()
    assert case["user_id"] == user["id"]
    assert case["status"] == "intake"

    intake_response = client.post(
        f"/api/v1/cases/{case['id']}/intake",
        headers=auth_header(token),
        json={"answers": [{"step": "injury", "answer": "重伤"}]},
    )
    assert intake_response.status_code == 200
    assert intake_response.json()["risk_level"] == "high"

    upload_response = client.post(
        "/api/v1/materials/upload-token",
        headers=auth_header(token),
        json={
            "case_id": case["id"],
            "material_type": "medical_invoice",
            "file_name": "invoice.jpg",
            "mime_type": "image/jpeg",
            "size": 1024,
        },
    )
    assert upload_response.status_code == 200
    upload = upload_response.json()
    assert upload["file_id"]

    material_response = client.post(
        "/api/v1/materials",
        headers=auth_header(token),
        json={
            "case_id": case["id"],
            "material_type": "medical_invoice",
            "file_id": upload["file_id"],
        },
    )
    assert material_response.status_code == 200
    material = material_response.json()
    assert material["status"] == "ocr_pending"

    products_response = client.get("/api/v1/orders/products")
    assert products_response.status_code == 200
    assert {product["sku"] for product in products_response.json()} == {
        "report",
        "claim_pack",
        "manual_review",
    }

    order_response = client.post(
        "/api/v1/orders",
        headers=auth_header(token),
        json={"case_id": case["id"], "product_sku": "report"},
    )
    assert order_response.status_code == 200
    order = order_response.json()
    assert order["amount"] == 2900

    pay_response = client.post(f"/api/v1/orders/{order['id']}/pay", headers=auth_header(token))
    assert pay_response.status_code == 200
    assert pay_response.json()["package"].startswith("prepay_id=mock-prepay-")


def test_claim_report_and_document_generation(client: TestClient) -> None:
    token, _ = login(client, "dev-claim")
    headers = auth_header(token)
    case = client.post(
        "/api/v1/cases",
        headers=headers,
        json={
            "title": "车辆追尾理赔",
            "accident_location": "上海浦东",
            "injury_level": "轻微伤",
            "has_insurance": True,
        },
    ).json()

    upload = client.post(
        "/api/v1/materials/upload-token",
        headers=headers,
        json={
            "case_id": case["id"],
            "material_type": "medical_invoice",
            "file_name": "invoice.jpg",
            "mime_type": "image/jpeg",
            "size": 1024,
        },
    ).json()
    material = client.post(
        "/api/v1/materials",
        headers=headers,
        json={
            "case_id": case["id"],
            "material_type": "medical_invoice",
            "file_id": upload["file_id"],
        },
    ).json()
    verify_response = client.patch(
        f"/api/v1/materials/{material['id']}/verify",
        headers=headers,
        json={"status": "ocr_done", "corrected_fields": {"medical_amount": 1200, "lost_work_days": 5}},
    )
    assert verify_response.status_code == 200

    report_response = client.post(f"/api/v1/claims/cases/{case['id']}/report", headers=headers)
    assert report_response.status_code == 200
    report = report_response.json()
    assert report["total_estimated_amount"] > 0
    assert {"医疗费", "误工费", "护理费", "交通费", "营养费", "车辆损失"} == {
        item["item_type"] for item in report["items"]
    }

    document_response = client.post(
        f"/api/v1/documents/cases/{case['id']}",
        headers=headers,
        json={"document_type": "claim_letter"},
    )
    assert document_response.status_code == 200
    document = document_response.json()
    assert document["document_type"] == "claim_letter"
    assert "辅助生成草稿" in document["content_redacted"]


def test_requires_auth_for_cases(client: TestClient) -> None:
    response = client.get("/api/v1/cases")
    assert response.status_code == 401


def test_user_cannot_access_another_users_case(client: TestClient) -> None:
    token_1, _ = login(client, "dev-user-a")
    token_2, _ = login(client, "dev-user-b")
    case_response = client.post(
        "/api/v1/cases",
        headers=auth_header(token_1),
        json={"title": "用户 A 案件"},
    )
    case_id = case_response.json()["id"]

    response = client.get(f"/api/v1/cases/{case_id}", headers=auth_header(token_2))
    assert response.status_code == 404
