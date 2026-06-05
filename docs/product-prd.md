# linkmai Product PRD

Date: 2026-06-06

## Positioning

linkmai is a traffic accident self-service assistant. It provides accident intake, material organization, compensation estimate reference, communication drafts, and document drafts. Complex or high-risk cases are routed to manual review.

Recommended public wording:

```text
linkmai provides traffic accident handling assistance, material organization, compensation estimate reference, and document draft generation. Complex or high-risk cases may require manual review or professional assistance.
```

Avoid:

- AI lawyer
- Replaces lawyers
- Guaranteed compensation
- Guaranteed win
- Automatic litigation agency
- No lawyer needed for all cases

## User Profiles

Primary users:

- Driver, passenger, pedestrian, or non-motor vehicle rider involved in a traffic accident.
- Does not understand accident handling procedure.
- Does not know claimable compensation items.
- Does not know required evidence.
- Wants a fast answer to "what should I do next?"

Typical segments:

- Minor vehicle damage user: needs repair, loss assessment, insurance communication.
- Light injury user: needs medical, lost income, nursing, transport expense estimation.
- Clear-liability but difficult negotiation user: needs evidence organization and communication drafts.
- High-risk user: death, serious injury, drunk driving, hit-and-run, no insurance, severe dispute; route to manual review.

## Core User Scenarios

MVP covers:

- User just had an accident and needs next-step guidance.
- User has accident certificate and wants to know compensation items.
- User has medical invoices, records, repair documents, and wants evidence organization.
- User wants an approximate compensation range.
- User needs communication scripts for insurer, other party, or mediation.
- User needs claim letter, evidence list, mediation application, or complaint draft.

MVP does not deeply cover:

- Death cases
- Serious injury cases
- Criminal-risk cases
- Drunk/drug driving or hit-and-run
- Multi-party complex liability
- Foreign-related cases
- Large commercial vehicle damage
- Formal lawyer agency

## Functional Modules

### 1. Login and User

- WeChat login.
- Phone authorization.
- User profile.
- Agreement and privacy confirmation.
- Sensitive information consent.
- Data deletion and account cancellation.

### 2. Accident Case Creation

Fields:

- Accident time
- Accident location
- Accident type
- Injury present
- Police reported
- Accident certificate available
- Insurance available
- Current handling stage

Output:

- Case number.
- Initial status.
- Initial risk level.

### 3. Structured Intake

- One core question per screen.
- Choice-first interaction.
- Supports dates, amounts, images, and short text.
- Dynamically adjusts next questions.
- Saves draft progress.
- Generates case summary and preliminary next step.

### 4. Material Center

Material types:

- Accident certificate
- Police mediation record
- Medical record
- Diagnosis certificate
- Medical invoice
- Medical expense list
- Repair quote
- Loss assessment
- Repair invoice
- Income proof
- Lost work proof
- ID card
- Driving license
- Vehicle license
- Insurance policy

Statuses:

- Not uploaded
- Uploaded
- OCR pending
- Recognized
- Needs supplement
- Verified
- Rejected

### 5. OCR and Evidence Check

- Extract accident certificate fields.
- Extract invoice amount.
- Extract repair amount.
- Extract liability ratio.
- User can correct OCR result.
- Evidence Agent creates missing material checklist.

### 6. Compensation Estimate

MVP items:

- Medical fee
- Lost income
- Nursing fee
- Nutrition fee
- Transport fee
- Vehicle repair cost
- Property loss

Non-MVP or manual-review items:

- Disability compensation
- Death compensation
- Mental damage compensation as deterministic result
- Complex liability apportionment

Output wording:

- "estimate reference"
- "based on current materials"
- "final result depends on negotiation, insurer review, mediation, or judgment"

### 7. AI Recommendations

Outputs:

- Current case progress.
- Missing materials.
- Next action.
- Who to communicate with.
- Risk warning.
- Manual review recommendation.

### 8. Document Drafts

MVP documents:

- Claim letter draft.
- Negotiation script.
- Evidence list.
- Mediation material draft.
- Complaint draft.

All documents must show:

```text
This is an auxiliary draft. Please verify the content yourself. Complex cases should be reviewed by a professional.
```

### 9. Orders and Payment

Service packages:

- Free intake.
- Compensation report.
- Claim material package.
- Pre-litigation package.
- Manual review.

Capabilities:

- Product list.
- Order creation.
- WeChat payment.
- Payment result.
- Entitlement unlock.
- Order list.
- Refund request.
- Customer service.

### 10. Manual Review

Triggers:

- High-risk rules.
- User actively requests review.
- AI/rules confidence low.
- Amount or materials abnormal.

Workflow:

```text
User submits case
-> system creates review work order
-> user pays if required
-> reviewer checks materials
-> reviewer marks risk and next step
-> user receives review result or service contact
```

## User Flows

### Main Flow

```text
Open mini program
-> tap Start Handling Accident
-> WeChat login
-> create case
-> answer intake
-> upload materials
-> generate material checklist
-> risk screening
-> generate compensation estimate
-> select paid package
-> WeChat Pay
-> unlock report or document package
-> generate drafts
-> continue case progress
```

### High-Risk Flow

```text
Create case
-> intake detects high-risk factor
-> stop automatic deep handling
-> show risk reason
-> recommend manual review
-> submit materials
-> create manual review work order
```

### Material Supplement Flow

```text
Open case
-> view material center
-> view missing materials
-> upload
-> OCR recognition
-> user confirms fields
-> update case completeness
-> regenerate report or document
```

### Payment Flow

```text
View preview
-> choose package
-> confirm service content and limitation
-> WeChat Pay
-> payment success
-> unlock entitlement
-> generate order record
```

## Page List

1. Home / handling desk
2. Login / authorization
3. Case creation
4. Accident intake
5. Case dashboard
6. Material center
7. Material recognition confirmation
8. Compensation estimate
9. Service package selection
10. Payment result
11. Report detail
12. Document generation
13. Document detail
14. Manual review
15. My profile
16. Admin console

## MVP Required

- WeChat login
- Phone authorization
- Case creation
- Accident intake
- Material upload
- Material status management
- Basic OCR
- Missing material checklist
- Basic compensation estimate
- WeChat Pay
- Order system
- Estimate report
- Claim communication draft
- Evidence list draft
- Risk detection
- Manual review entry
- User agreement, privacy policy, disclaimer
- Admin case and order management

## MVP Not Required

- Multi-user case collaboration.
- Real-time lawyer chat.
- Court filing integration.
- Insurance company system integration.
- Automatic submission to court or insurer.
- Automatic negotiation agency.
- Guaranteed compensation.
- Automatic disability grading.
- Full death compensation calculation.
- Nationwide local standards coverage.
- Automatic judgment of complex liability.

## Success Metrics

First 30 days:

- Case creation completion rate.
- Intake completion rate.
- Material upload rate.
- Compensation report generation rate.
- Paid conversion rate.
- Manual review conversion rate.
- High-risk detection rate.
- Payment success rate.
- Customer complaint rate.
- Post-report continued-action rate.

Primary early success question:

```text
Can a user after an accident complete case creation, understand missing materials, and obtain a readable compensation estimate and next-step guide?
```

