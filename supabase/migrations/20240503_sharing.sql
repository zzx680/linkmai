-- Add sharing columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS share_token uuid UNIQUE DEFAULT NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS share_enabled boolean NOT NULL DEFAULT false;

-- Allow anonymous users to read shared documents
CREATE POLICY "Public can read shared documents"
  ON documents FOR SELECT
  TO anon
  USING (share_enabled = true);

-- Ensure document_versions has RLS enabled
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read versions of shared documents
CREATE POLICY "Public can read versions of shared documents"
  ON document_versions FOR SELECT
  TO anon
  USING (
    document_id IN (
      SELECT id FROM documents WHERE share_enabled = true
    )
  );

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_documents_share_token
  ON documents(share_token)
  WHERE share_token IS NOT NULL;
