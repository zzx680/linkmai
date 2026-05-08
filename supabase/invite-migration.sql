-- Invite codes table for closed beta access control
CREATE TABLE IF NOT EXISTS invite_codes (
  code TEXT PRIMARY KEY,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
-- No RLS policies — only service role (admin client) can access this table

-- Seed initial invite codes for testing
INSERT INTO invite_codes (code, note) VALUES
  ('LINK2026', '内测种子码 1'),
  ('BETA8888', '内测种子码 2'),
  ('LAW2026A', '内测种子码 3'),
  ('FIRM2026', '内测种子码 4'),
  ('CASE2026', '内测种子码 5')
ON CONFLICT (code) DO NOTHING;
