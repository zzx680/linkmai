# linkmai Technical Architecture

Date: 2026-06-06

## Architecture Summary

MVP should use a modular monolith backend with async workers. This is simpler to launch and easier to audit than microservices.

Recommended stack:

- Mini program: WeChat native mini program + TypeScript
- Admin: React + Ant Design Pro
- Backend: FastAPI/Python
- Database: PostgreSQL + pgvector
- Cache/queue: Redis + Celery or Dramatiq
- File storage: Tencent Cloud COS
- OCR: Tencent Cloud OCR
- AI: LLM gateway + RAG + rule engine + agent orchestration
- Deploy: Tencent Cloud CVM/TKE + CDB PostgreSQL + Redis + COS + WAF + KMS + CLS

## Mini Program Pages

```text
pages/index                  handling home
pages/login                  WeChat login / phone authorization
pages/cases/list             case list
pages/cases/detail           case dashboard
pages/intake/chat            structured intake
pages/materials/index        material center
pages/materials/upload       material upload
pages/claim/report           compensation report
pages/documents/index        document generation
pages/orders/checkout        package purchase
pages/orders/list            order list
pages/profile/index          profile
pages/legal/privacy          privacy policy
pages/legal/terms            user agreement
```

Bottom tabs:

```text
处理 / 案件 / 材料 / 我的
```

Frontend capabilities:

- `wx.login`
- Phone button with `open-type="getPhoneNumber"`
- `wx.requestPayment`
- `wx.uploadFile`
- Lightweight store
- Self-built components with WeUI-compatible basics

## Backend Modules

```text
api/
  auth          login, phone, token
  user          profile, consents, cancellation
  case          case management and state machine
  intake        structured accident intake
  material      upload, OCR, evidence checks
  claim         compensation rule engine
  document      document draft generation
  payment       WeChat Pay, orders, refunds
  ai            agent orchestration, RAG, model calls
  admin         admin console APIs
  audit         audit logs
  notification  service notifications
```

Layering:

```text
Controller/API
-> Service
-> Domain: case state, risk rules, claim rules
-> Repository
-> Workers: OCR, AI, document jobs
```

## Core Database Tables

### Users

```text
users
- id
- openid
- unionid
- phone_encrypted
- phone_hash
- nickname
- avatar_url
- status
- created_at
- updated_at

user_consents
- id
- user_id
- consent_type: privacy / sensitive_info / ai_processing / phone
- version
- granted_at
- revoked_at
- ip
```

### Cases

```text
cases
- id
- user_id
- case_no
- title
- accident_time
- accident_location
- province
- city
- accident_type
- responsibility_type
- injury_level
- has_insurance
- risk_level: low / medium / high
- status: intake / pending_material / calculating / report_ready / negotiation / litigation_prepare / manual_review / closed
- summary
- created_at
- updated_at

case_parties
- id
- case_id
- party_type: self / other_driver / insurer / police / hospital
- name_encrypted
- phone_encrypted
- vehicle_plate_encrypted
- insurer_name
- policy_no_encrypted
```

### Intake

```text
intake_sessions
- id
- case_id
- user_id
- status
- current_step
- collected_slots_json
- created_at
- updated_at

intake_messages
- id
- session_id
- role: user / assistant / system
- content_redacted
- structured_payload_json
- created_at
```

### Materials

```text
materials
- id
- case_id
- user_id
- material_type: accident_certificate / medical_record / invoice / repair_quote / income_proof / insurance_policy
- file_id
- status: uploaded / ocr_pending / ocr_done / verified / rejected / need_more
- ocr_result_json
- reviewer_id
- created_at

files
- id
- owner_user_id
- case_id
- bucket
- object_key
- file_name
- mime_type
- size
- sha256
- encryption_key_id
- status
- created_at
```

### Claims

```text
claim_reports
- id
- case_id
- user_id
- version
- total_estimated_amount
- confidence_level
- status
- calculation_input_json
- calculation_output_json
- rule_version
- created_at

claim_items
- id
- report_id
- item_type: medical_fee / lost_income / nursing_fee / nutrition_fee / transport_fee / vehicle_damage
- amount
- formula
- evidence_status
- basis_text
- missing_materials_json

claim_rule_sets
- id
- province
- city
- version
- effective_date
- rules_json
- status
```

### Documents

```text
documents
- id
- case_id
- user_id
- document_type: claim_letter / negotiation_script / mediation_application / evidence_list / complaint_draft
- title
- content_redacted
- file_id
- ai_run_id
- status
- created_at
```

### Orders

```text
products
- id
- sku
- name
- price
- entitlement_json
- status

orders
- id
- user_id
- case_id
- order_no
- product_id
- amount
- status: pending / paid / failed / refunded / closed
- paid_at
- created_at

payments
- id
- order_id
- provider: wechat_pay
- prepay_id
- transaction_id
- out_trade_no
- callback_payload_json
- status
- created_at

refunds
- id
- order_id
- refund_no
- amount
- reason
- status
```

### AI and Audit

```text
ai_runs
- id
- case_id
- user_id
- agent_type
- model
- prompt_version
- input_redacted
- output_redacted
- tool_calls_json
- token_usage_json
- latency_ms
- status
- created_at

audit_logs
- id
- actor_type: user / admin / system / agent
- actor_id
- action
- resource_type
- resource_id
- before_json
- after_json
- ip
- user_agent
- created_at
```

## API Surface

### Auth

```text
POST /api/auth/wechat-login
POST /api/auth/phone
POST /api/auth/refresh
POST /api/auth/logout
```

### Cases

```text
GET    /api/cases
POST   /api/cases
GET    /api/cases/{case_id}
PATCH  /api/cases/{case_id}
POST   /api/cases/{case_id}/submit-intake
```

### Intake

```text
POST /api/intake/sessions
POST /api/intake/sessions/{id}/messages
GET  /api/intake/sessions/{id}
```

### Materials

```text
POST  /api/materials/upload-token
POST  /api/materials
GET   /api/cases/{case_id}/materials
POST  /api/materials/{id}/ocr
PATCH /api/materials/{id}/verify
```

### Claims

```text
POST /api/cases/{case_id}/claim-reports
GET  /api/claim-reports/{report_id}
GET  /api/claim-rules/version
```

### Documents

```text
POST /api/cases/{case_id}/documents
GET  /api/documents/{document_id}
POST /api/documents/{document_id}/export
```

### Payments

```text
GET  /api/products
POST /api/orders
POST /api/orders/{order_id}/pay
POST /api/payments/wechat/callback
GET  /api/orders/{order_id}
POST /api/refunds
```

### Admin

```text
GET  /api/admin/cases
GET  /api/admin/orders
GET  /api/admin/materials
POST /api/admin/manual-review
POST /api/admin/rules/publish
POST /api/admin/prompts/publish
```

## WeChat Pay Flow

```text
1. User chooses service package.
2. Frontend calls POST /api/orders.
3. Backend creates pending order.
4. Frontend calls POST /api/orders/{id}/pay.
5. Backend calls WeChat Pay JSAPI/mini program transaction API.
6. Backend returns timeStamp, nonceStr, package, signType, paySign.
7. Mini program calls wx.requestPayment.
8. WeChat calls /api/payments/wechat/callback.
9. Backend verifies signature, decrypts callback, checks amount and out_trade_no.
10. Backend marks payment and order as paid.
11. Backend unlocks entitlements.
```

Payment rules:

- Order number is globally unique.
- Callback handler is idempotent.
- Backend product price is the source of truth.
- Frontend payment success callback is not the source of truth.
- Entitlements are recorded as order snapshots.

## File Storage and OCR

```text
Mini program requests upload token
-> backend issues COS temporary credential or upload URL
-> mini program uploads file
-> backend registers files/materials
-> OCR async task starts
-> OCR result is written to materials.ocr_result_json
-> Evidence Agent checks material validity
```

Storage requirements:

- Private COS bucket.
- Object key contains no real personal information.
- Short-lived download URLs.
- Sensitive material encrypted.
- Hash deduplication.
- File size/type/count limits.
- User deletion triggers delete or soft-delete retention workflow.

OCR priority:

1. Accident certificate
2. Medical invoice / medical record
3. Repair quote / loss assessment
4. Income proof / lost work proof
5. Insurance policy

## AI Agent Orchestration

Agents:

- Orchestrator Agent: state, permissions, call sequence.
- Intake Agent: structured intake and slot filling.
- Evidence Agent: material checklist and OCR validation.
- Risk Agent: high-risk detection and manual review routing.
- Claim Calculator: deterministic rule engine, not LLM.
- Legal RAG Agent: retrieves reviewed legal/rule/template knowledge.
- Document Agent: drafts documents.
- Review Agent: checks overclaiming, prohibited wording, and compliance.

Flow:

```text
Create case
-> Intake Agent
-> Risk Agent
-> Evidence Agent
-> OCR Worker
-> Claim Calculator
-> Legal RAG Agent
-> Document Agent
-> Review Agent
-> manual review when high-risk
```

Hard rules:

- Compensation amount is calculated by rules, not LLM.
- RAG only uses reviewed knowledge base.
- Agent outputs are structured JSON.
- AI calls record prompt version, model, redacted input/output, and tool calls.
- Document generation checks paid entitlement.
- High-risk label cannot be manually dismissed by user.

## Security and Privacy

Must implement:

- HTTPS.
- Store AppSecret, payment key, APIv3 key, model keys in KMS or equivalent.
- Short-lived access token + refresh token.
- User can only access own cases.
- Admin RBAC.
- Encrypt sensitive fields: phone, ID number, plate, policy number, medical details.
- Redact logs.
- Redact or pseudonymize AI inputs.
- Separate consent for phone, sensitive information, AI processing, material upload.
- Data deletion and account cancellation.
- Audit log when admin views materials.
- Rate limits for login, OCR, AI, payment APIs.

## Admin Console

Required modules:

- User management
- Case management
- Material management
- OCR result view/correction
- Claim report view
- Document view
- Order/refund management
- Manual review work orders
- Risk case queue
- Prompt version management
- Rule version management
- RAG knowledge base management
- Audit logs
- System config

Roles:

```text
Customer support: basic case and order info
Reviewer: materials and OCR, sensitive fields masked by default
Legal review: case, estimate, document review
Admin: rules, prompts, knowledge base
Super admin: system config and permissions
```

## Deployment

Production:

```text
WeChat Mini Program
-> HTTPS API domain
-> Tencent Cloud WAF / CLB
-> Backend API
-> PostgreSQL
-> Redis
-> Worker queue
-> COS
-> OCR
-> LLM gateway
```

Environments:

```text
dev
staging
prod
```

Pre-launch config:

- Mini program legal request domain.
- Upload/download domains.
- HTTPS certificate.
- ICP and mini program filing.
- WeChat Pay merchant.
- Payment callback URL.
- Privacy policy and user agreement pages.

