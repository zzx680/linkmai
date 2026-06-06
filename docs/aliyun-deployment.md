# Aliyun Deployment Plan

Date: 2026-06-06

This is the pragmatic first deployment plan for linkmai using an existing Aliyun ECS server.

## Recommended MVP Architecture

```text
WeChat Mini Program
-> https://api.your-domain.com
-> Nginx on Aliyun ECS
-> FastAPI backend
-> PostgreSQL
-> Redis
-> Aliyun OSS
```

For early MVP, PostgreSQL and Redis can run on the same ECS if traffic is low. For production, move PostgreSQL to Aliyun RDS and keep OSS for files.

## ECS Requirements

Minimum for development/staging:

- 2 vCPU
- 4 GB RAM
- Ubuntu 22.04 or Alibaba Cloud Linux 3
- 40 GB disk

Production baseline:

- 2-4 vCPU
- 8 GB RAM
- Separate data disk
- Security group only opens 80/443/22
- PostgreSQL port not public

## Server Packages

Install:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nginx postgresql postgresql-contrib redis-server
```

## PostgreSQL

Create database:

```bash
sudo -u postgres psql
```

Inside psql:

```sql
create user linkmai with password 'replace-with-strong-password';
create database linkmai owner linkmai;
\q
```

Run schema:

```bash
psql "postgresql://linkmai:replace-with-strong-password@127.0.0.1:5432/linkmai" -f backend/sql/schema.sql
```

## Backend Runtime

```bash
cd /srv/linkmai/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```text
APP_ENV=prod
DATABASE_URL=postgresql+psycopg://linkmai:replace-with-strong-password@127.0.0.1:5432/linkmai
JWT_SECRET=replace-with-long-random-secret
```

Run manually for test:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## Nginx

Example config:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Production needs HTTPS. Use Aliyun certificate or Certbot.

## systemd Service

Create `/etc/systemd/system/linkmai-api.service`:

```ini
[Unit]
Description=linkmai FastAPI backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/srv/linkmai/backend
Environment="PATH=/srv/linkmai/backend/.venv/bin"
ExecStart=/srv/linkmai/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable linkmai-api
sudo systemctl start linkmai-api
```

## Aliyun OSS

Use OSS for:

- Accident certificate images
- Medical records
- Invoices
- Repair documents
- Generated report/document files

Rules:

- Private bucket.
- No public read.
- Backend issues short-lived signed upload/download URLs.
- Object keys must not contain real names, phone numbers, ID numbers, or plate numbers.

## WeChat Mini Program Configuration

In WeChat Mini Program admin console configure:

- request合法域名: `https://api.your-domain.com`
- uploadFile合法域名: `https://api.your-domain.com` or OSS upload domain if direct upload is used
- downloadFile合法域名: `https://api.your-domain.com` or OSS signed download domain

You also need:

- ICP备案 for domain.
- Mini program备案.
- HTTPS certificate.
- WeChat Pay merchant account before real payment.

## Security Baseline

Required before production:

- HTTPS only.
- Strong database password.
- PostgreSQL not exposed publicly.
- Secrets not committed to git.
- Sensitive data encrypted or masked.
- Admin access logged.
- File access via short-lived signed URLs.
- Backups enabled.
- Security group restricted.

