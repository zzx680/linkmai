create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  openid text not null unique,
  unionid text,
  phone_encrypted text,
  phone_hash text,
  phone_masked text,
  nickname text,
  avatar_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_consents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id),
  consent_type text not null,
  version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  ip text
);

create table if not exists cases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id),
  case_no text not null unique,
  title text not null,
  accident_time timestamptz,
  accident_location text,
  province text,
  city text,
  accident_type text,
  responsibility_type text,
  injury_level text,
  has_insurance boolean,
  risk_level text not null default 'low',
  status text not null default 'intake',
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists case_parties (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references cases(id),
  party_type text not null,
  name_encrypted text,
  phone_encrypted text,
  vehicle_plate_encrypted text,
  insurer_name text,
  policy_no_encrypted text
);

create table if not exists intake_sessions (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references cases(id),
  user_id uuid not null references users(id),
  status text not null default 'active',
  current_step text,
  collected_slots_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists materials (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references cases(id),
  user_id uuid not null references users(id),
  material_type text not null,
  file_id uuid,
  status text not null default 'uploaded',
  ocr_result_json jsonb,
  reviewer_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists files (
  id uuid primary key default uuid_generate_v4(),
  owner_user_id uuid not null references users(id),
  case_id uuid references cases(id),
  bucket text not null,
  object_key text not null,
  file_name text not null,
  mime_type text not null,
  size integer not null,
  sha256 text,
  encryption_key_id text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists claim_reports (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references cases(id),
  user_id uuid not null references users(id),
  version integer not null default 1,
  total_estimated_amount numeric(12, 2),
  confidence_level text,
  status text not null default 'draft',
  calculation_input_json jsonb not null default '{}',
  calculation_output_json jsonb not null default '{}',
  rule_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists claim_items (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references claim_reports(id),
  item_type text not null,
  amount numeric(12, 2) not null default 0,
  formula text,
  evidence_status text,
  basis_text text,
  missing_materials_json jsonb not null default '[]'
);

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references cases(id),
  user_id uuid not null references users(id),
  document_type text not null,
  title text not null,
  content_redacted text,
  file_id uuid,
  ai_run_id uuid,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  sku text not null unique,
  name text not null,
  price integer not null,
  entitlement_json jsonb not null default '{}',
  status text not null default 'active'
);

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id),
  case_id uuid not null references cases(id),
  order_no text not null unique,
  product_id uuid not null references products(id),
  amount integer not null,
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id),
  provider text not null default 'wechat_pay',
  prepay_id text,
  transaction_id text,
  out_trade_no text,
  callback_payload_json jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists ai_runs (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id),
  user_id uuid references users(id),
  agent_type text not null,
  model text,
  prompt_version text,
  input_redacted text,
  output_redacted text,
  tool_calls_json jsonb,
  token_usage_json jsonb,
  latency_ms integer,
  status text not null default 'ok',
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_type text not null,
  actor_id uuid,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  before_json jsonb,
  after_json jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
