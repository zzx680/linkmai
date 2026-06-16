# linkmai Backend

FastAPI backend for the linkmai WeChat Mini Program.

Target production deployment:

```text
WeChat Mini Program
-> HTTPS API domain
-> Aliyun ECS
-> FastAPI backend
-> PostgreSQL
-> Aliyun OSS for files
-> Redis for async jobs and rate limits
```

## Current Scope

This backend includes:

- Health API
- Development login API with JWT auth
- User, consent, case, material, product, order, payment persistence
- Per-user case/material/order ownership checks
- PostgreSQL SQLAlchemy models
- Alembic initial migration
- PostgreSQL schema draft
- Environment config sample
- API integration tests

It does not yet include:

- Production WeChat login credentials and rollout validation
- Real OSS upload
- Real WeChat Pay
- OCR/AI workers

## Local Setup

Create a virtual environment:

```bash
cd /Users/charlie/Documents/linkmai/backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open:

```text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
```

Development login:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/users/login \
  -H 'Content-Type: application/json' \
  -d '{"code":"dev-user-1","nickname":"测试用户"}'
```

Use the returned token for protected APIs:

```text
Authorization: Bearer <access_token>
```

## Database

The app can auto-create local development tables when `DB_AUTO_CREATE=true` and `APP_ENV` is not `prod`.

Migration:

```bash
cd /Users/charlie/Documents/linkmai/backend
alembic upgrade head
```

Schema draft remains available:

```text
backend/sql/schema.sql
```

For production, use PostgreSQL 15+ on Aliyun ECS or Aliyun RDS. For MVP development, ECS-hosted PostgreSQL is acceptable. For production sensitive data, prefer RDS + encrypted disks + strict security group rules.

## Tests

```bash
cd /Users/charlie/Documents/linkmai/backend
.venv/bin/pytest -q
```
