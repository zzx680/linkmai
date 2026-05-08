-- SMS verification codes (replaces in-memory Map for serverless compatibility)
CREATE TABLE IF NOT EXISTS sms_codes (
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (phone)
);

ALTER TABLE sms_codes ENABLE ROW LEVEL SECURITY;

-- No RLS policies — service role only for write, anon can read (only own phone via webhook)
CREATE POLICY "Service role can manage sms_codes"
  ON sms_codes FOR ALL TO service_role
  USING (true);

CREATE POLICY "Users can read own sms_codes"
  ON sms_codes FOR SELECT TO authenticated
  USING (phone IN (SELECT phone FROM auth.users WHERE id = auth.uid()));

-- Auto-cleanup expired codes every hour
CREATE OR REPLACE FUNCTION cleanup_expired_sms_codes()
RETURNS void AS $$
  DELETE FROM sms_codes WHERE expires_at < NOW();
$$ LANGUAGE sql SECURITY DEFINER;

-- Invite codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  code TEXT PRIMARY KEY,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- No RLS policies — service role / admin only for invite_codes

-- Seed initial invite codes for testing
INSERT INTO invite_codes (code, note) VALUES
  ('LINK2026', '内测种子码 1'),
  ('BETA8888', '内测种子码 2'),
  ('LAW2026A', '内测种子码 3'),
  ('FIRM2026', '内测种子码 4'),
  ('CASE2026', '内测种子码 5')
ON CONFLICT (code) DO NOTHING;
