# linkmai

linkmai is a WeChat Mini Program for traffic accident self-service handling. It helps users create an accident case, organize materials, estimate compensation, prepare communication drafts, and route high-risk cases to manual review.

## Current Status

This repository currently contains:

- Product and launch planning in `docs/`
- Product/UI design specification in `docs/product-ui-spec.md`
- A WeChat Mini Program MVP prototype
- Mock data for the main user journey

The current prototype is frontend-only. Real WeChat login, backend APIs, OCR, payment, and AI workflows are planned in `docs/technical-architecture.md` and `docs/mvp-backlog.md`.

## Mini Program Pages

- `pages/index/index`: handling home
- `pages/login/index`: login, consent, authorization placeholder
- `pages/intake/index`: structured accident intake
- `pages/cases/list/index`: case list
- `pages/cases/detail/index`: case dashboard
- `pages/materials/index/index`: material center
- `pages/claim/report/index`: compensation estimate
- `pages/documents/index/index`: document drafts
- `pages/orders/checkout/index`: service package and payment placeholder
- `pages/profile/index`: profile, orders, legal/privacy entries
- `pages/legal/privacy/index`: privacy policy summary
- `pages/legal/terms/index`: user agreement summary

## How To Open

1. Open WeChat DevTools.
2. Import this folder: `/Users/charlie/Documents/linkmai`.
3. Use the test app id or replace `appid` in `project.config.json`.
4. Compile and preview.

## Product Boundary

Use these terms:

- Traffic accident self-service assistant
- Compensation estimate reference
- Document draft
- Manual review for complex cases

Avoid these terms:

- AI lawyer
- Replace lawyers
- Guaranteed compensation
- Guaranteed win
- Automatic litigation agency

## Next Engineering Steps

1. Confirm WeChat service category and entity requirements.
2. Connect the GitHub remote once local git permissions allow it.
3. Replace mock data with backend APIs.
4. Implement WeChat login and phone authorization.
5. Implement case, material, claim report, order, and payment APIs.
6. Add OCR and rule engine.
7. Add admin console.

## Backend

Backend skeleton:

```text
backend/
```

Aliyun deployment notes:

```text
docs/aliyun-deployment.md
```
