-- Add new columns to cases table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS client_phone text;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS fee_amount integer;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS fee_status text NOT NULL DEFAULT 'unpaid';

-- Case deadlines table
CREATE TABLE IF NOT EXISTS case_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE case_deadlines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'case_deadlines' AND policyname = 'Users see own deadlines') THEN
    CREATE POLICY "Users see own deadlines" ON case_deadlines FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'case_deadlines' AND policyname = 'Users create own deadlines') THEN
    CREATE POLICY "Users create own deadlines" ON case_deadlines FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'case_deadlines' AND policyname = 'Users update own deadlines') THEN
    CREATE POLICY "Users update own deadlines" ON case_deadlines FOR UPDATE TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'case_deadlines' AND policyname = 'Users delete own deadlines') THEN
    CREATE POLICY "Users delete own deadlines" ON case_deadlines FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_case_deadlines_case_id ON case_deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_case_deadlines_due_date ON case_deadlines(due_date);
