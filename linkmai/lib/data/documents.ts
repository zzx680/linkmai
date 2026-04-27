import { createClient } from '@/lib/supabase/server'
import type { Document, DocumentVersion, CreateDocumentInput } from '@/lib/types'

export async function getDocumentsByCase(caseId: string): Promise<Document[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('case_id', caseId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('documents')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version', { ascending: false })
  if (error) throw error
  return data
}

export async function getLatestVersion(documentId: string): Promise<DocumentVersion | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return data
}

export async function saveDocumentVersion(
  documentId: string,
  content: string,
  source: 'ai' | 'human' = 'ai',
  changeNote?: string
): Promise<DocumentVersion> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: doc } = await supabase
    .from('documents')
    .select('current_version')
    .eq('id', documentId)
    .single()

  const nextVersion = (doc?.current_version || 0) + 1

  const { data: version, error: vErr } = await supabase
    .from('document_versions')
    .insert({ document_id: documentId, user_id: user.id, version: nextVersion, content, source, change_note: changeNote })
    .select()
    .single()
  if (vErr) throw vErr

  await supabase.from('documents').update({ current_version: nextVersion }).eq('id', documentId)

  return version
}
