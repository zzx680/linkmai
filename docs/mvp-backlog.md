# linkmai MVP Backlog

Date: 2026-06-06

This backlog turns the launch plan into implementation work. It is organized by workstream and week so a small team can start immediately.

## Workstreams

- Mini program: user-facing WeChat Mini Program.
- Backend: API, database, rules, jobs.
- Admin: operations and manual review console.
- AI/rules: intake, evidence, risk, claim calculation, RAG, documents.
- Compliance/ops: review materials, agreements, privacy, payment, customer service.

## Week 1: Project Foundation

### Mini Program

- Initialize WeChat Mini Program project with TypeScript.
- Configure page routes and bottom tabs: `处理 / 案件 / 材料 / 我的`.
- Build design tokens: color, spacing, typography, button states.
- Add basic layout components: page shell, status bar, action button, card, alert.

Acceptance:

- Mini program can run locally in WeChat DevTools.
- Four tabs render with placeholder pages.

### Backend

- Initialize FastAPI project.
- Add PostgreSQL connection, migrations, config management.
- Create schema v1: users, consents, cases, materials, files, products, orders.
- Add health check and basic API routing.

Acceptance:

- Backend starts in dev.
- Migrations run from empty database.
- Health check returns OK.

### Admin

- Initialize React + Ant Design Pro admin project.
- Add login placeholder.
- Add layout and route placeholders.

Acceptance:

- Admin app runs locally with placeholder pages.

### Compliance/Ops

- Confirm enterprise主体, service category, filing path, payment merchant requirements.
- Draft user agreement, privacy policy, disclaimer, AI service explanation.
- Define prohibited wording list.

Acceptance:

- Compliance docs have owner and review status.
- Service category uncertainty is tracked as a launch blocker until confirmed.

## Week 2: Login and Case System

### Mini Program

- Implement login trigger on case creation.
- Implement agreement/privacy checkbox.
- Implement phone authorization flow.
- Build case creation form.
- Build case list and case detail shell.

Acceptance:

- User can create account and first case.
- User cannot create case without required consent.

### Backend

- Implement `POST /api/auth/wechat-login`.
- Implement `POST /api/auth/phone`.
- Implement JWT/session.
- Implement case CRUD.
- Implement case state machine.
- Add user consent records.

Acceptance:

- API creates user from WeChat login code.
- Case ownership is enforced.
- Case state transitions are validated.

### Admin

- Add user list.
- Add case list and case detail.

Acceptance:

- Admin can view created users/cases.

## Week 3: Intake and Risk

### Mini Program

- Build structured intake page.
- Add question components: option, amount, date, location text, upload prompt.
- Add progress indicator and save/exit.
- Show preliminary case summary.

Acceptance:

- User can complete basic accident intake in under 3 minutes.

### Backend

- Implement intake sessions and messages.
- Implement intake slot storage.
- Implement risk rules v1.
- Update case summary and risk level.

Acceptance:

- High-risk inputs route case to `manual_review`.
- Low-risk cases proceed to material checklist.

### AI/Rules

- Define intake question config.
- Define risk trigger rules.
- Implement Review Agent boundary prompt for prohibited outputs.

Acceptance:

- Risk rules catch death, serious injury, drunk driving, hit-and-run, no insurance, major dispute.

## Week 4: Materials and OCR

### Mini Program

- Build material center.
- Build upload page.
- Build OCR result confirmation UI.
- Show missing material checklist.

Acceptance:

- User can upload material and see status updates.

### Backend

- Implement upload token API.
- Register file and material records.
- Add OCR async worker.
- Store OCR result.
- Add material verification endpoint.

Acceptance:

- OCR job changes material from uploaded to ocr_done.
- User correction is saved.

### Admin

- Add material list.
- Add material detail with masked fields.
- Add audit log when admin opens material.

Acceptance:

- Admin material access is logged.

## Week 5: Compensation Calculation

### Mini Program

- Build compensation report page.
- Show amount range, item rows, formula, evidence status, missing materials.
- Add CTA for paid full report/material package.

Acceptance:

- User can understand what is calculated and what is missing.

### Backend

- Implement claim rule engine v1.
- Implement claim report generation.
- Store claim items.
- Add rule versioning.

Acceptance:

- Medical fee, lost income, nursing, nutrition, transport, vehicle damage are calculated from structured inputs.
- Report avoids guaranteed wording.

### AI/Rules

- Build rules JSON for MVP.
- Build explanation template.
- Add Review Agent check for deterministic legal claims.

Acceptance:

- LLM does not determine amounts; it only explains rule output.

## Week 6: Payment and Entitlements

### Mini Program

- Build service package page.
- Build payment checkout.
- Call `wx.requestPayment`.
- Build order list and payment result page.
- Build refund request entry.

Acceptance:

- User can pay for a package and see unlocked service.

### Backend

- Implement products and orders.
- Implement WeChat Pay JSAPI/mini program payment.
- Implement callback verification and idempotency.
- Implement entitlement unlock.
- Implement refund request skeleton.

Acceptance:

- Server-side callback unlocks paid entitlement.
- Duplicate callbacks do not duplicate entitlement.
- Frontend amount cannot override product price.

### Compliance/Ops

- Finalize package descriptions and refund policy.
- Add customer service entry.

Acceptance:

- Payment page clearly states included content, excluded content, delivery, refund rule.

## Week 7: Document Generation and Admin Operations

### Mini Program

- Build document generation page.
- Build document detail page.
- Add copy/save capability.
- Add manual review page.

Acceptance:

- Paid user can generate at least three drafts: claim letter, negotiation script, evidence list.

### Backend

- Implement document generation API.
- Check entitlement before generation.
- Store document and AI run.
- Add manual review work orders.

Acceptance:

- Document generation is blocked without entitlement.
- AI run is logged with prompt version and redacted content.

### AI/Rules

- Create document templates.
- Build Legal RAG v1.
- Implement Document Agent.
- Implement Review Agent output filter.

Acceptance:

- Drafts include case data and draft disclaimer.
- Prohibited wording is blocked.

### Admin

- Add order/refund list.
- Add manual review queue.
- Add AI run logs.
- Add prompt/rule version view.

Acceptance:

- Operator can handle a high-risk work order.

## Week 8: Launch Hardening

### Mini Program

- Polish UI states: empty, loading, error, success.
- Add data deletion and account cancellation entry.
- Add legal pages.
- Prepare review screenshots.

Acceptance:

- Main user journey is complete in staging.

### Backend

- Add encryption for sensitive fields.
- Add log redaction.
- Add rate limiting.
- Add monitoring and alerts.
- Add data deletion workflow.
- Run staging acceptance tests.

Acceptance:

- Sensitive material access is audited.
- User can delete case data.
- Logs do not contain full sensitive fields.

### Compliance/Ops

- Confirm WeChat service category and filing.
- Configure legal domains.
- Configure payment merchant and callback.
- Prepare WeChat review submission.
- Prepare test account and test case.

Acceptance:

- WeChat review package is complete.
- Launch blockers are listed and owned.

## MVP Launch Blockers

- WeChat service category not confirmed.
- Legal qualification or partner lawyer documentation missing if required.
- Payment merchant not approved.
- ICP/mini program filing incomplete.
- Privacy policy/user agreement not reviewed.
- Sensitive information consent not implemented.
- Data deletion not implemented.
- Payment callback not verified and idempotent.
- High-risk routing not implemented.
- Admin cannot view cases/orders/materials.

## Initial Team Split

Suggested small team:

- Product/Founder: scope, pricing, legal category, partner review.
- Mini Program Engineer: all user-facing flows.
- Backend Engineer: API, schema, payment, workers, rules.
- AI Engineer: intake, RAG, document templates, review guardrails.
- Admin/Ops Engineer: admin console, audit, customer service tools.
- Legal/Compliance Advisor: service boundary, agreements, privacy, advertising, review documents.

## Immediate Next Actions

1. Confirm WeChat service category and entity requirements.
2. Decide whether MVP starts with one city/province or national basic rules.
3. Choose mini program stack: native TypeScript recommended.
4. Create repositories or monorepo structure.
5. Start Week 1 foundation tasks.

