-- ── Billing tables ────────────────────────────────────────────────────────────
-- Run this migration in Supabase SQL Editor

-- User credits: one row per user, tracks balance in 分 (integer cents)
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_charged INTEGER NOT NULL DEFAULT 0,
  total_topup INTEGER NOT NULL DEFAULT 0,
  annual_card_expires_at TIMESTAMPTZ NULL,         -- NULL = no active card
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Credit transactions: full ledger
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user
  ON credit_transactions(user_id, created_at DESC);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ── RPC: add_credits ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_metadata JSONB
) RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  INSERT INTO user_credits (user_id, balance, total_topup)
  VALUES (p_user_id, p_amount, GREATEST(p_amount, 0))
  ON CONFLICT (user_id) DO UPDATE
  SET balance      = user_credits.balance + p_amount,
      total_topup  = user_credits.total_topup + GREATEST(p_amount, 0),
      updated_at   = now()
  RETURNING balance INTO v_new_balance;

  INSERT INTO credit_transactions (user_id, amount, balance_after, description, metadata)
  VALUES (p_user_id, p_amount, v_new_balance, p_description, p_metadata);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── RPC: deduct_credits ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_metadata JSONB
) RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE user_credits
  SET balance       = balance - p_amount,
      total_charged = total_charged + p_amount,
      updated_at    = now()
  WHERE user_id = p_user_id AND balance >= p_amount
  RETURNING balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  INSERT INTO credit_transactions (user_id, amount, balance_after, description, metadata)
  VALUES (p_user_id, -p_amount, v_new_balance, p_description, p_metadata);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Trigger: welcome bonus for new users ─────────────────────────────────────
-- New users get ¥19 (one free draft)
CREATE OR REPLACE FUNCTION handle_new_user_credits() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance, total_topup)
  VALUES (NEW.id, 1900, 1900);

  INSERT INTO credit_transactions (user_id, amount, balance_after, description, metadata)
  VALUES (NEW.id, 1900, 1900, '新用户注册赠送（1次免费起草）', '{"type": "welcome_bonus"}');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_credits();
