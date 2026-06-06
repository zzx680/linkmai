# linkmai Product and UI Specification

Date: 2026-06-06

This document defines the next product/UI baseline for the linkmai WeChat Mini Program MVP.

## Product Experience Principle

Users arrive after a traffic accident. The interface should reduce cognitive load and show one clear next action.

Core promise:

```text
Create a case, know what material is missing, estimate compensation, prepare claim documents, and route complex matters to manual review.
```

Product voice:

- Short
- Direct
- Calm
- No legal overstatement
- No guaranteed results

## First Screen Requirement

The first screen is not a marketing page. It is a handling desk.

Must show:

- Product name and service boundary.
- Primary action: start handling accident.
- Current case, if any.
- Next action.
- Case progress.
- Risk reminder.
- Quick entries.

Avoid:

- Large promotional hero.
- Long legal explanation.
- "Ask AI anything" as the primary entry.
- Any promise of winning or guaranteed compensation.

## Navigation

Bottom tabs:

```text
处理 / 案件 / 材料 / 我的
```

Rationale:

- `处理`: command center and primary flow.
- `案件`: case list and status.
- `材料`: evidence completion.
- `我的`: orders, legal, privacy, data rights.

No standalone AI tab in MVP. AI is embedded in intake, material review, estimate explanation, and document drafting.

## Core Page States

### Home

States:

- No case: start case CTA.
- Active case: next action and progress.
- High-risk case: route to manual review CTA.
- Paid user: show unlocked report/document shortcut.

### Login

States:

- Not agreed: login button blocked with toast.
- Agreed: login can proceed.
- Future implementation: `wx.login` loading, phone authorization, backend error.

### Intake

States:

- Question selection.
- Missing required answer.
- Saved draft.
- High-risk trigger.
- Completed intake.

### Case Dashboard

States:

- Building case.
- Pending material.
- Report ready.
- Negotiation.
- Manual review.

Always show one primary next action.

### Material Center

Statuses:

- Not uploaded.
- Uploading.
- OCR pending.
- Recognized.
- Needs supplement.
- Verified.
- Failed.

Each material card must explain why the material matters.

### Compensation Report

Must show:

- Amount range, not single promise.
- Each compensation item.
- Evidence state.
- Calculation explanation.
- Missing material impact.
- Disclaimer.

### Payment

Must show:

- Included content.
- Excluded content.
- Delivery method.
- Refund rules.
- Result limitation.

## Visual System

Design direction: calm professional tool.

Colors:

```text
Primary        #123D36
Primary soft   #EDF3F1
Secondary      #5E7F78
Background     #F6F8F7
Surface        #FFFFFF
Main text      #18211F
Muted text     #6B7471
Border         #E1E7E4
Warning        #B7791F
Warning bg     #FFF7E8
Risk           #C2413B
Risk bg        #FFF1F0
Success        #2F855A
Success bg     #EDF7F1
```

Shape:

- Cards: 16rpx radius.
- Buttons: 16rpx radius.
- Tags: pill radius.
- Avoid cards inside cards.

Typography:

- Page title: 44-52rpx.
- Section title: 30-34rpx.
- Body: 26-28rpx.
- Helper text: 22-24rpx.
- No viewport-dependent font scaling.

## Components

Required components:

- Handling hero.
- Case status card.
- Next action panel.
- Stage rail.
- Risk banner.
- Material card.
- Estimate item.
- Service package card.
- Legal limit notice.
- Empty state.
- Error state.

## Copy Rules

Good:

```text
你现在需要补充医疗发票。
这些材料会影响医疗费和误工费测算。
```

Good:

```text
测算金额为参考结果，最终以协商、调解或裁判结果为准。
```

Avoid:

```text
本案可赔 24,300 元。
```

Avoid:

```text
不用律师，AI 帮你搞定全部流程。
```

## Product Backlog For UI Polish

1. Add home stage rail.
2. Improve current case card information hierarchy.
3. Add status-specific material cards.
4. Add package comparison details.
5. Add disabled/loading visual states.
6. Add high-risk manual review state.
7. Add empty state for no case/material/order.
8. Add document generation page after payment.

## Skill-Based UI Pass: 2026-06-06

Design direction applied with `frontend-design`:

```text
Restrained accident-handling command center.
```

Changes made:

- Home now communicates current stage, next action, missing material count, and unlocked capabilities.
- Case dashboard now includes a stage rail, risk explanation, progress rows, and document draft status.
- Intake now explains why each question is asked, shows selected answers, supports draft save feedback, and previews high-risk routing.
- Material center now differentiates upload, supplement, and view actions by material state.
- Compensation estimate now shows material completeness, item-level basis, missing material impact, and a clear re-calculate/package action split.
- Payment page now distinguishes included content, excluded content, delivery method, refund rule, and service limitations.
- Document draft page was added to complete the product loop from estimate to claim package.

Remaining UI gaps:

- Real loading states for login, upload, OCR, report generation, and payment.
- Real empty states for users without cases/orders/materials.
- Real error states from backend APIs.
- Visual QA inside WeChat DevTools on iPhone-size and large-screen previews.
- Icon system for tab and quick actions once asset strategy is chosen.
