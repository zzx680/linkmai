# linkmai UI Design

Date: 2026-06-06

## Design Goal

The user may be anxious after an accident. The UI should restore control:

- Trustworthy: professional assistant, not a chat toy.
- Clear: each screen solves one problem.
- Process-oriented: always show current step and next action.
- Low pressure: limited red, limited legal jargon.
- Bounded: AI is assistance, not lawyer agency.

## Information Architecture

Main areas:

```text
处理
案件
材料
我的
```

Core object: case.

```text
User
- WeChat identity
- Phone
- Orders
- Consents

Case
- Accident information
- Liability information
- Injury/property damage
- Materials
- Claim estimate
- Documents
- Risk level
- Paid entitlements
- Manual review status
```

## Home

Purpose: start or continue accident handling immediately.

Layout:

```text
linkmai
交通事故自助处理助手

[开始处理事故]

Current case card:
事故类型 / 车牌或地点
状态: 待补充医疗材料
下一步: 上传病历和发票
[继续处理]

Quick entries:
上传材料 / 赔偿测算 / 生成文书 / 人工复核

Bottom note:
复杂事故、重伤、酒驾、逃逸等情况将建议人工复核
```

Avoid marketing hero layouts. The first screen should be the actual handling tool.

## Accident Intake

Format: structured single-question flow with light conversational framing.

Example:

```text
事故问诊
进度: 3/9

事故责任认定了吗？
如果还没拿到事故认定书，也可以先继续建档。

[已认定，对方全责]
[已认定，我方全责]
[双方都有责任]
[还没有认定]

[上一步] [继续]
```

Interaction rules:

- One core question per screen.
- Prefer options over free text.
- Use dedicated controls for date, amount, location, upload.
- Uploaded material can auto-fill questions.
- Save draft on exit.

## Case Dashboard

This is the product control center.

Layout:

```text
案件状态:
建档中 / 待补材料 / 已测算 / 协商中 / 诉前准备

下一步:
上传医疗发票
预计需要 2 分钟

风险等级:
低 / 中 / 高

处理进度:
事故信息  已完成
责任信息  已完成
医疗材料  待补充
赔偿测算  未生成
文书材料  未生成

[上传缺失材料]
[查看赔偿测算]
[生成理赔材料包]
```

Rule: always show one clear primary action.

## Material Center

Group by purpose:

```text
事故责任
- 事故认定书
- 交警调解记录

医疗材料
- 病历
- 发票
- 费用清单
- 诊断证明

收入与误工
- 劳动合同
- 工资流水
- 误工证明

车辆损失
- 定损单
- 维修发票
- 车辆照片

身份与保险
- 身份证
- 驾驶证
- 行驶证
- 保险单
```

Statuses:

- 未上传
- 识别中
- 已通过
- 需补充
- 无法识别

Material card example:

```text
病历
用于判断伤情和赔偿项目
状态: 未上传
[上传]
```

## Compensation Estimate

Goal: explain what can be claimed, why, and what is missing.

Layout:

```text
预估赔偿金额
¥18,600 - ¥24,300

该金额为辅助测算，最终以协商、调解或裁判结果为准。

医疗费      ¥8,200    已有发票
误工费      ¥6,000    缺收入证明
护理费      ¥2,400    需确认护理天数
交通费      ¥300      建议补充票据
车辆损失    ¥7,800    已有定损单

[生成理赔材料包]
```

Each item expands to:

- Calculation method
- Required materials
- Current evidence
- Uncertainty

## Payment Page

Show exactly what the user buys.

Package examples:

```text
测算报告
- 赔偿项目拆分
- 金额区间测算
- 缺失材料清单

理赔材料包
- 测算报告
- 理赔沟通稿
- 证据目录
- 理赔函草稿

人工复核
- 专业人员查看材料
- 标记风险点
- 给出处理建议
```

Payment page must include:

- Service name
- Price
- Included content
- Excluded content
- Delivery method
- Estimated generation time
- Refund rule
- WeChat Pay button

Required reminders:

- Documents are drafts.
- No guaranteed compensation amount.
- No lawyer agency is formed by default.
- High-risk cases may need manual review.

## Profile

Structure:

```text
用户信息
- 微信头像/昵称
- 手机号绑定状态

我的服务
- 我的订单
- 已购买报告
- 人工复核记录

支持
- 联系客服
- 常见问题
- 意见反馈

法律与隐私
- 用户协议
- 隐私政策
- AI 服务说明
- 数据删除
- 注销账号
```

`数据删除` should be visible and easy to find.

## Visual Style

Direction: calm professional tool.

Colors:

```text
Primary: #123D36
Secondary: #5E7F78
Background: #F6F8F7
Card: #FFFFFF
Main text: #18211F
Secondary text: #6B7471
Warning: #B7791F
Risk: #C2413B
Success: #2F855A
Border: #E1E7E4
```

Avoid:

- Large red areas.
- Purple-blue gradients.
- Heavy "AI tech" look.
- Luxury law firm gold style.
- Cards inside cards.

## Components

Core components:

- Case status bar
- Next action card
- Material status card
- Risk alert
- Estimate item row
- Service package card
- Upload component
- Intake option button
- Evidence checklist
- Payment entitlement summary

Button hierarchy:

```text
Primary: 继续处理 / 开始处理 / 支付
Secondary: 查看详情 / 重新上传
Weak: 稍后处理 / 返回
Danger: 删除案件 / 注销账号
```

## Empty States

Examples:

```text
暂无案件
开始创建事故案件，系统会帮你整理材料、测算赔偿并生成处理建议。
[开始处理事故]
```

```text
暂无材料
上传事故认定书后，我们可以自动识别责任信息并生成下一步清单。
[上传事故认定书]
```

```text
暂无订单
购买测算报告或材料包后，会在这里显示服务记录。
```

## Error States

Examples:

```text
材料识别失败
这张图片可能不够清晰。请重新拍摄，确保文字完整、无遮挡。
[重新上传]
```

```text
支付未完成
当前订单尚未支付成功，你可以重新支付或稍后再试。
[重新支付]
```

```text
测算暂时无法生成
缺少医疗发票或费用信息。补充材料后可以继续测算。
[去补充材料]
```

## Risk Messages

Low:

```text
当前案件信息较完整，可以继续生成赔偿测算。
```

Medium:

```text
当前案件存在责任或材料不确定项，测算结果可能有偏差。
```

High:

```text
当前案件涉及复杂情况，建议人工复核后再继续处理。
```

## Copy Style

Principles:

- Short sentences.
- Clear next action.
- No frightening wording.
- No guaranteed outcomes.
- Avoid dense legal citation.
- Tell the user what to do first, then explain why.

Good:

```text
你现在需要补充医疗发票。
这些材料会影响医疗费和误工费测算。
```

Avoid:

```text
根据相关法律法规，你应当提交充分证据以主张合法权益。
```

Core reminder:

```text
linkmai 提供交通事故处理辅助，不替代律师代理。
测算金额为参考结果，最终金额以协商、调解或裁判结果为准。
复杂案件建议人工复核。
```

