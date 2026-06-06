# linkmai Backend

FastAPI backend skeleton for the linkmai WeChat Mini Program.

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

This backend skeleton includes:

- Health API
- User API shape
- Case API shape
- Material API shape
- Product/order API shape
- PostgreSQL schema draft
- Environment config sample

It does not yet include:

- Real WeChat login exchange
- Real PostgreSQL repository implementation
- Real OSS upload
- Real WeChat Pay
- OCR/AI workers

## Local Setup

Create a virtual environment:

```bash
cd /Users/charlie/Documents/linkmai/backend
python3 -m venv .venv
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

## Database

Schema draft:

```text
backend/sql/schema.sql
```

For production, use PostgreSQL 15+ on Aliyun ECS or Aliyun RDS. For MVP development, ECS-hosted PostgreSQL is acceptable. For production sensitive data, prefer RDS + encrypted disks + strict security group rules.

