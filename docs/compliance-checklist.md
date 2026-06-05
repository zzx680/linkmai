# linkmai Compliance and Launch Checklist

Date: 2026-06-06

This is a product planning checklist, not formal legal advice. Confirm service category, required qualifications, AI filing/algorithm filing, and manual review service boundaries with WeChat platform support and a qualified lawyer.

## Overall Boundary

Recommended public positioning:

```text
交通事故自助处理助手，提供材料整理、赔偿测算、沟通文案和文书草稿辅助；复杂案件转人工复核。
```

Avoid:

- AI 律师
- 替代律师
- 自动代理诉讼
- 保证多赔
- 保证胜诉

## Entity, Verification, Filing, Category

Must have:

- Enterprise主体小程序, not personal主体.
- WeChat mini program verification.
- Mini program filing / app filing.
- Backend ICP filing.
- HTTPS domain configured in mini program legal domains.
- WeChat Pay merchant account.
- Business license scope reviewed for legal consulting, information consulting, software service, internet information service, technical service, or relevant approved scope.
- Mini program name, avatar, and description must not imply official police, court, insurer, or lawyer association identity.

Service category:

- First check whether WeChat currently supports a legal service category suitable for the business.
- If legal service category requires law firm/lawyer credentials, prepare partner law firm/lawyer qualification and authorization documents.
- Do not use unrelated categories to disguise actual legal-service nature.

Needs confirmation:

- Whether non-law-firm entity can use the relevant legal service category.
- Whether compensation estimate + document draft is treated as legal service by WeChat.
- Whether an ICP commercial license is required if introducing third-party lawyers, marketplace functions, paid consultation, or user-generated public content.

## Required Legal Pages

### User Agreement

Must include:

- Service provider and contact.
- Service content: case creation, material checklist, compensation estimate, document draft, manual review.
- Service nature: auxiliary tool, not formal lawyer agency.
- User obligation: uploaded materials are true, lawful, and authorized.
- Paid entitlement: package content, validity, usage count.
- Refund rules.
- Dispute resolution.
- Minor usage rules.
- Data deletion and account cancellation.

### Privacy Policy

Must include:

- Collected data: openid, phone, case data, accident data, vehicle data, injury data, medical invoice, medical record, income proof, ID, order/payment data.
- Purpose for each data type.
- Sensitive information categories: ID, medical health, income/financial, location/accident place, plate, driving license, vehicle license, insurance policy.
- Third-party sharing: OCR, cloud storage, AI model provider, WeChat Pay, SMS/customer service, manual/legal review.
- User rights: access, correction, deletion, authorization withdrawal, account cancellation, copy, complaint.
- Security: encryption, RBAC, audit logs, desensitization, minimal retention.
- Cross-border data: default should not be cross-border; if using overseas model/API, perform separate assessment and disclosure.

### Disclaimer

Must include:

- Estimate amount is for reference only.
- No guaranteed final result.
- Documents are drafts.
- AI outputs may be wrong, incomplete, or unsuitable for the specific case.
- High-risk cases should be reviewed by professionals.
- Platform does not represent police, court, insurer, or judicial authority.

### AI Service Explanation

Must include:

- AI is used for intake, material summary, draft generation, explanation.
- AI does not independently decide compensation amount, risk level, or litigation strategy.
- AI outputs are checked by rules or manual review when required.
- User must not upload unauthorized third-party private materials.
- Generated content is marked as AI-assisted/draft.

## Personal and Sensitive Information

Must implement:

- Privacy agreement before creating case.
- Separate consent before uploading medical record, invoice, ID, income proof.
- Avoid precise location unless necessary; accident place can be manually entered.
- Mask ID, medical, income fields by default.
- Private encrypted file storage.
- Short-lived download URLs.
- Backend RBAC: support, reviewer, legal review, admin.
- Audit logs for material access.
- User can delete cases, materials, and request account cancellation.
- Retention period is defined; example 1-3 years after case closure, pending legal review.
- User case data is not used for model training unless separately consented and desensitized.

Sensitive categories:

- Medical health
- ID documents
- Income flow
- Financial account information
- Location/trajectory
- Vehicle plate
- Insurance policy

## Legal Service Boundary

Allowed:

- Traffic accident process guide.
- Material checklist.
- Compensation estimate based on user input and rules.
- Public law/process explanation.
- Claim letter, mediation draft, evidence list, complaint draft.
- Risk reminders.
- Manual review entry.

Cautious or prohibited:

- "This case can definitely claim X."
- "Court will support X."
- "You should immediately sue."
- "We represent you."
- "One-on-one lawyer service" without qualified lawyer/contract.
- Automatic filing/submission to court, insurer, or third party.

Recommended wording:

```text
以下内容为辅助信息，不构成正式律师意见。
测算结果基于你提供的材料和公开规则，最终以协商、保险审核、调解或裁判结果为准。
复杂案件建议由执业律师复核。
```

Needs lawyer confirmation:

- Manual reviewer qualification.
- Partner lawyer/law firm fee-sharing structure.
- Whether complaint draft and evidence list trigger stricter legal service regulation.
- Whether the phrase "lawyer review" can be used inside the mini program.

## Advertising and Copy Restrictions

High-risk wording:

- AI 律师
- 替代律师
- 不用律师
- 保证赔偿
- 保证胜诉
- 100% 多赔
- 法院必支持
- 最快拿钱
- 全国第一 / 最专业 / 最权威 / 最佳
- 官方指定
- 交警/法院/保险公司合作平台, unless truly authorized
- 无风险维权
- 不成功不收费, unless rules are precise and lawful

Recommended wording:

- 交通事故自助处理助手
- 帮你整理材料、估算赔偿、生成沟通草稿
- 复杂案件可申请人工复核
- 结果以保险审核、调解或裁判为准

## Payment, Refund, Customer Service

Payment requirements:

- WeChat Pay merchant account.
- Clear SKUs: estimate report, claim material package, pre-litigation package, manual review.
- Before payment show service content, price, delivery method, expected delivery time, refund rule.
- Use WeChat Pay server order and payment callback.
- Generate order, entitlement, receipt/invoice explanation after payment.
- Support refund request, refund review, refund callback, refund status query.

Refund suggestion:

- Report/document not yet generated: full refund.
- Report/document already generated: no unconditional refund by default, but refund or remedy for service failure, duplicate payment, or obvious error.
- Manual review not assigned: refundable.
- Manual review started: partial refund based on service progress.
- Rules must be visible before payment.

Customer service:

- In-app customer service.
- Order after-sale entry.
- Complaint entry.
- Service hours.
- Data deletion/account cancellation.
- High-risk manual contact mechanism.

## WeChat Review Materials

Prepare:

- Business license.
- Mini program verification.
- Filing information.
- Service category qualification.
- Partner lawyer/law firm qualification and authorization if using lawyer review.
- Privacy policy URL.
- User agreement URL.
- Service disclaimer.
- Payment service and refund description.
- Test account.
- Test case.
- Test payment instructions.
- Admin screenshots or instructions if required.
- Customer service contact.
- Screenshots: login, case creation, material upload, estimate, payment, order, refund, profile, privacy settings.

Pre-review self-check:

- Home accurately describes actual function.
- No inducement to share/follow.
- No false or absolute advertising.
- Login is not forced too early.
- No phone/location/photo/file access before authorization.
- No misleading official identity.
- No paid entitlement promised before payment.

## Risk Routing Rules

Stop pure AI automatic handling and route to manual review when:

- Death, serious injury, disability-grade dispute.
- Drunk driving, drug driving, hit-and-run, unlicensed driving, fake plate, criminal risk.
- Multi-car/multi-party, operating vehicle, ride-hailing, freight vehicle complex liability.
- No insurance, insurer refusal, coverage insufficient.
- Liability unclear or user disagrees with accident certificate.
- Other party lost contact, refuses compensation, threatens, dispute escalates.
- Minor, elderly person, pregnant person, or person with mental disability involved.
- Estimated compensation exceeds defined threshold, initially RMB 100k-200k pending legal confirmation.
- Limitation period risk.
- User asks for agency, negotiation, guaranteed result.
- Material suspected forged, altered, contradictory.
- User uploads another person's private material without authorization.
- AI confidence low, key materials missing, rules do not cover.

Risk output:

```text
当前案件不适合仅由 AI 自动处理。
```

Then show:

- Reason.
- Next material checklist.
- Manual review or offline lawyer recommendation.
- No deterministic compensation conclusion.

## Items to Confirm

- WeChat service category fit.
- Whether a law firm/legal qualification主体 is required.
- Whether manual reviewers must be licensed lawyers.
- Whether business scope of "legal consulting" is sufficient.
- Whether the chosen generative AI model/provider has required China filings.
- Whether linkmai itself needs algorithm/generative AI filing.
- Whether compensation estimation is treated as automated decision-making affecting rights.
- Whether refund rules for digital reports/documents are sufficient.
- User case material retention period.
- Partner lawyer/law firm responsibility and revenue sharing.

## Reference Links

- [WeChat Mini Program release](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/release.html)
- [WeChat Mini Program filing guide](https://developers.weixin.qq.com/miniprogram/product/record_guidelines.html)
- [WeChat Pay refund documentation](https://pay.wechatpay.cn/doc/v3/merchant/4013071001)
- [Personal Information Protection Law](https://www.npc.gov.cn/npc/c2/c30834/202108/t20210820_313088.html)
- [Lawyers Law](https://www.npc.gov.cn/zgrdw/npc/xinwen/2017-09/12/content_2028697.htm)
- [Interim Measures for Generative AI Services](https://www.gov.cn/zhengce/zhengceku/202307/content_6891752.htm)
- [Advertising Law](https://www.npc.gov.cn/npc/c1773/c1848/c21114/c25274/c25277/201905/t20190521_207459.html)
- [E-Commerce Law](https://www.npc.gov.cn/WZWSREL3pncmR3L25wYy9sZnp0L3JseXcvMjAxOC0wOC8zMS9jb250ZW50XzIwNjA4MjcuaHRt)

