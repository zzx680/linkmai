"""initial core tables

Revision ID: 0001_initial_core
Revises:
Create Date: 2026-06-07
"""
from alembic import op
import sqlalchemy as sa


revision = "0001_initial_core"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("openid", sa.String(length=128), nullable=False),
        sa.Column("unionid", sa.String(length=128)),
        sa.Column("phone_encrypted", sa.Text()),
        sa.Column("phone_hash", sa.String(length=128)),
        sa.Column("nickname", sa.String(length=128)),
        sa.Column("avatar_url", sa.Text()),
        sa.Column("phone_masked", sa.String(length=32)),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_openid", "users", ["openid"], unique=True)

    op.create_table(
        "user_consents",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("consent_type", sa.String(length=64), nullable=False),
        sa.Column("version", sa.String(length=32), nullable=False),
        sa.Column("granted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True)),
        sa.Column("ip", sa.String(length=64)),
    )
    op.create_index("ix_user_consents_user_id", "user_consents", ["user_id"])

    op.create_table(
        "cases",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("case_no", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("accident_time", sa.DateTime(timezone=True)),
        sa.Column("accident_location", sa.Text()),
        sa.Column("province", sa.String(length=64)),
        sa.Column("city", sa.String(length=64)),
        sa.Column("accident_type", sa.String(length=64)),
        sa.Column("responsibility_type", sa.String(length=64)),
        sa.Column("injury_level", sa.String(length=64)),
        sa.Column("has_insurance", sa.Boolean()),
        sa.Column("risk_level", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("summary", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_cases_user_id", "cases", ["user_id"])
    op.create_index("ix_cases_case_no", "cases", ["case_no"], unique=True)

    op.create_table(
        "case_parties",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("case_id", sa.Uuid(), sa.ForeignKey("cases.id"), nullable=False),
        sa.Column("party_type", sa.String(length=32), nullable=False),
        sa.Column("name_encrypted", sa.Text()),
        sa.Column("phone_encrypted", sa.Text()),
        sa.Column("vehicle_plate_encrypted", sa.Text()),
        sa.Column("insurer_name", sa.String(length=128)),
        sa.Column("policy_no_encrypted", sa.Text()),
    )
    op.create_index("ix_case_parties_case_id", "case_parties", ["case_id"])

    op.create_table(
        "files",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("owner_user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("case_id", sa.Uuid(), sa.ForeignKey("cases.id")),
        sa.Column("bucket", sa.String(length=128), nullable=False),
        sa.Column("object_key", sa.Text(), nullable=False),
        sa.Column("file_name", sa.Text(), nullable=False),
        sa.Column("mime_type", sa.String(length=128), nullable=False),
        sa.Column("size", sa.Integer(), nullable=False),
        sa.Column("sha256", sa.String(length=128)),
        sa.Column("encryption_key_id", sa.String(length=128)),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_files_owner_user_id", "files", ["owner_user_id"])

    op.create_table(
        "materials",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("case_id", sa.Uuid(), sa.ForeignKey("cases.id"), nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("material_type", sa.String(length=64), nullable=False),
        sa.Column("file_id", sa.Uuid(), sa.ForeignKey("files.id")),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("ocr_result_json", sa.JSON()),
        sa.Column("reviewer_id", sa.Uuid()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_materials_case_id", "materials", ["case_id"])
    op.create_index("ix_materials_user_id", "materials", ["user_id"])

    op.create_table(
        "claim_reports",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("case_id", sa.Uuid(), sa.ForeignKey("cases.id"), nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("total_estimated_amount", sa.Numeric(12, 2)),
        sa.Column("confidence_level", sa.String(length=32)),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("calculation_input_json", sa.JSON(), nullable=False),
        sa.Column("calculation_output_json", sa.JSON(), nullable=False),
        sa.Column("rule_version", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_claim_reports_case_id", "claim_reports", ["case_id"])
    op.create_index("ix_claim_reports_user_id", "claim_reports", ["user_id"])

    op.create_table(
        "claim_items",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("report_id", sa.Uuid(), sa.ForeignKey("claim_reports.id"), nullable=False),
        sa.Column("item_type", sa.String(length=64), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("formula", sa.Text()),
        sa.Column("evidence_status", sa.String(length=32)),
        sa.Column("basis_text", sa.Text()),
        sa.Column("missing_materials_json", sa.JSON(), nullable=False),
    )
    op.create_index("ix_claim_items_report_id", "claim_items", ["report_id"])

    op.create_table(
        "ai_runs",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("case_id", sa.Uuid(), sa.ForeignKey("cases.id")),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id")),
        sa.Column("agent_type", sa.String(length=64), nullable=False),
        sa.Column("model", sa.String(length=128)),
        sa.Column("prompt_version", sa.String(length=64)),
        sa.Column("input_redacted", sa.Text()),
        sa.Column("output_redacted", sa.Text()),
        sa.Column("tool_calls_json", sa.JSON()),
        sa.Column("token_usage_json", sa.JSON()),
        sa.Column("latency_ms", sa.Integer()),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "documents",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("case_id", sa.Uuid(), sa.ForeignKey("cases.id"), nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("document_type", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("content_redacted", sa.Text()),
        sa.Column("file_id", sa.Uuid(), sa.ForeignKey("files.id")),
        sa.Column("ai_run_id", sa.Uuid(), sa.ForeignKey("ai_runs.id")),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_documents_case_id", "documents", ["case_id"])
    op.create_index("ix_documents_user_id", "documents", ["user_id"])

    op.create_table(
        "products",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("sku", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("entitlement_json", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
    )
    op.create_index("ix_products_sku", "products", ["sku"], unique=True)

    op.create_table(
        "orders",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("case_id", sa.Uuid(), sa.ForeignKey("cases.id"), nullable=False),
        sa.Column("order_no", sa.String(length=32), nullable=False),
        sa.Column("product_id", sa.Uuid(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("paid_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_orders_user_id", "orders", ["user_id"])
    op.create_index("ix_orders_case_id", "orders", ["case_id"])
    op.create_index("ix_orders_order_no", "orders", ["order_no"], unique=True)

    op.create_table(
        "payments",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("order_id", sa.Uuid(), sa.ForeignKey("orders.id"), nullable=False),
        sa.Column("provider", sa.String(length=32), nullable=False),
        sa.Column("prepay_id", sa.String(length=128)),
        sa.Column("transaction_id", sa.String(length=128)),
        sa.Column("out_trade_no", sa.String(length=64)),
        sa.Column("callback_payload_json", sa.JSON()),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_payments_order_id", "payments", ["order_id"])

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("actor_type", sa.String(length=32), nullable=False),
        sa.Column("actor_id", sa.Uuid()),
        sa.Column("action", sa.String(length=64), nullable=False),
        sa.Column("resource_type", sa.String(length=64), nullable=False),
        sa.Column("resource_id", sa.Uuid()),
        sa.Column("before_json", sa.JSON()),
        sa.Column("after_json", sa.JSON()),
        sa.Column("ip", sa.String(length=64)),
        sa.Column("user_agent", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_index("ix_payments_order_id", table_name="payments")
    op.drop_table("payments")
    op.drop_index("ix_orders_order_no", table_name="orders")
    op.drop_index("ix_orders_case_id", table_name="orders")
    op.drop_index("ix_orders_user_id", table_name="orders")
    op.drop_table("orders")
    op.drop_index("ix_products_sku", table_name="products")
    op.drop_table("products")
    op.drop_index("ix_materials_user_id", table_name="materials")
    op.drop_index("ix_materials_case_id", table_name="materials")
    op.drop_table("materials")
    op.drop_index("ix_documents_user_id", table_name="documents")
    op.drop_index("ix_documents_case_id", table_name="documents")
    op.drop_table("documents")
    op.drop_table("ai_runs")
    op.drop_index("ix_claim_items_report_id", table_name="claim_items")
    op.drop_table("claim_items")
    op.drop_index("ix_claim_reports_user_id", table_name="claim_reports")
    op.drop_index("ix_claim_reports_case_id", table_name="claim_reports")
    op.drop_table("claim_reports")
    op.drop_index("ix_files_owner_user_id", table_name="files")
    op.drop_table("files")
    op.drop_index("ix_case_parties_case_id", table_name="case_parties")
    op.drop_table("case_parties")
    op.drop_index("ix_cases_case_no", table_name="cases")
    op.drop_index("ix_cases_user_id", table_name="cases")
    op.drop_table("cases")
    op.drop_index("ix_user_consents_user_id", table_name="user_consents")
    op.drop_table("user_consents")
    op.drop_index("ix_users_openid", table_name="users")
    op.drop_table("users")
