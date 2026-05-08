-- Contact form submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  firm TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'closed')),
  replied_at TIMESTAMPTZ,
  reply_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (public form)
CREATE POLICY "Anyone can insert contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Only admin/service role can read/update
CREATE POLICY "Service role full access to contacts"
  ON contact_submissions FOR ALL
  USING (auth.jwt() IS NOT NULL AND auth.jwt()->>'role' = 'service_role');