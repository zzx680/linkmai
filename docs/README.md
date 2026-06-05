# linkmai WeChat Mini Program Launch Plan

Date: 2026-06-06

linkmai is a traffic accident self-service assistant for WeChat Mini Program. It helps users create an accident case, organize evidence, estimate compensation, prepare communication drafts, and generate document drafts. Complex or high-risk matters are routed to manual review.

Important positioning:

- Use: "traffic accident self-service assistant", "material organization", "compensation estimate reference", "document draft".
- Avoid: "AI lawyer", "replace lawyers", "guaranteed compensation", "guaranteed win", "automatic litigation agency".

## Launch Goal

Ship a compliant MVP that can be submitted to WeChat review, accept WeChat login, process payments, and complete the standard traffic accident workflow:

```text
Open mini program
-> login when creating a case
-> create accident case
-> answer structured intake questions
-> upload materials
-> OCR and evidence checks
-> generate missing material list
-> run risk rules
-> generate compensation estimate
-> pay for report/material package
-> generate communication and document drafts
-> route high-risk cases to manual review
```

## MVP Scope

MVP covers standard cases:

- Police report or accident certificate exists, or the user has already reported the accident.
- Common vehicle, non-motor vehicle, pedestrian accident scenarios.
- Property damage, light injury, ordinary medical expense claims.
- Other party has insurance or insurance information is available.

MVP excludes or routes to manual review:

- Death, serious injury, disability-grade disputes.
- Drunk driving, drug driving, hit-and-run, unlicensed driving, criminal risk.
- Multi-party or highly disputed liability.
- No insurance, insurer refusal, insurance coverage shortage.
- Large estimated compensation, initially above RMB 100k-200k pending legal confirmation.
- User asks for agency, negotiation on behalf, litigation filing, or guaranteed results.

## Product Modules

1. WeChat login and user account
2. Case creation and case state machine
3. Structured accident intake
4. Material center and OCR
5. Missing evidence checklist
6. Compensation calculation rule engine
7. AI-assisted recommendations
8. Document draft generation
9. WeChat Pay, orders, refunds, entitlements
10. Manual review workflow
11. Admin console
12. Legal, privacy, AI service, and payment disclosures

## Recommended Tech Stack

- Mini program: WeChat native mini program with TypeScript
- Admin console: React + Ant Design Pro
- Backend: FastAPI/Python modular monolith
- Database: PostgreSQL + pgvector
- Queue/cache: Redis + Celery or Dramatiq
- Storage: Tencent Cloud COS private bucket
- OCR: Tencent Cloud OCR
- AI: LLM gateway + RAG + rules + agent orchestration
- Deployment: Tencent Cloud CVM/TKE, CDB PostgreSQL, Redis, COS, WAF, KMS, CLS

## Main Navigation

Bottom tabs:

```text
处理 / 案件 / 材料 / 我的
```

AI should be embedded in flows, not exposed as a free-form "Ask AI" tab in MVP.

## Monetization

Recommended first-version SKUs:

- Free: basic intake, material checklist, risk screening
- Compensation report: RMB 19-39
- Claim material package: RMB 69-99
- Pre-litigation preparation package: RMB 199-399
- Manual review: RMB 299+

Payment rules:

- Use WeChat Pay JSAPI/mini program payment.
- Backend creates orders and prepay session.
- Frontend calls `wx.requestPayment`.
- Server-side payment callback is the source of truth.
- Paid entitlements are unlocked only after verified callback.
- Refund rules are shown before payment.

## 8-Week Launch Roadmap

### Week 1: Foundation

- Confirm business entity, service category, legal boundary.
- Initialize mini program, backend, admin console repositories.
- Define schema v1 for users, cases, materials, orders.
- Draft privacy policy, user agreement, service disclaimer.
- Set up dev/staging/prod environments.

### Week 2: Login and Cases

- Implement `wx.login`.
- Implement phone authorization.
- Implement JWT/session management.
- Implement case creation and case list.
- Implement case state machine.
- Implement agreement and privacy confirmation.

### Week 3: Intake and Risk

- Build structured accident intake.
- Implement intake slots and dynamic question flow.
- Generate case summary.
- Implement high-risk screening rules.
- Route high-risk cases to manual review state.

### Week 4: Materials and OCR

- Implement COS upload.
- Build material center.
- Add material status flow.
- Integrate OCR worker.
- Add OCR result confirmation.
- Add admin material view with audit logging.

### Week 5: Compensation Calculation

- Build rule engine v1.
- Implement medical fee, lost income, nursing fee, nutrition fee, transport fee, vehicle damage.
- Generate report with amount range, formula, evidence status, missing material list.
- Add report page and report history.

### Week 6: Payment and Entitlements

- Configure products/SKUs.
- Create orders.
- Integrate WeChat Pay JSAPI/mini program payment.
- Verify callback signature and amount.
- Unlock report/document entitlements.
- Add order list and refund request entry.

### Week 7: AI/RAG Documents and Admin

- Build Legal RAG knowledge base v1.
- Add document templates.
- Implement Document Agent and Review Agent.
- Generate claim letter, negotiation script, evidence list, complaint draft.
- Add admin case, order, manual review, AI log views.

### Week 8: Hardening and Review

- Security hardening, encryption, desensitization.
- Add data deletion and account cancellation.
- Finish refund/customer service flows.
- Prepare WeChat review materials.
- Run staging acceptance tests.
- Submit WeChat review.

## Launch Acceptance Criteria

- User can log in with WeChat.
- User can authorize phone number.
- User can create a traffic accident case.
- User can complete accident intake.
- System can detect high-risk cases.
- User can upload materials.
- OCR can produce structured material results.
- System can generate missing material checklist.
- System can generate compensation estimate report.
- User can complete WeChat payment.
- Payment callback unlocks entitlements.
- User can generate document drafts.
- Admin can view cases, materials, orders, AI logs, manual review work orders.
- User can delete case data and request account cancellation.
- Sensitive fields are encrypted, masked, or redacted.
- Privacy policy, user agreement, service disclaimer, AI explanation, refund rules are available.
- WeChat legal domains, filing, payment merchant, and review materials are ready.

## Companion Documents

- [Product PRD](./product-prd.md)
- [Technical Architecture](./technical-architecture.md)
- [UI Design](./ui-design.md)
- [Compliance Checklist](./compliance-checklist.md)

