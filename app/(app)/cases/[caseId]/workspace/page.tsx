import { createClient } from '@/lib/supabase/server'
import { getCaseById } from '@/lib/data/cases'
import { getDocumentsByCase } from '@/lib/data/documents'
import { notFound } from 'next/navigation'
import WorkspaceClient from './WorkspaceClient'

export const dynamic = 'force-dynamic'

export default async function WorkspacePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [caseData, documents] = await Promise.all([
    getCaseById(caseId),
    getDocumentsByCase(caseId),
  ])

  if (!caseData) notFound()

  return <WorkspaceClient caseData={caseData} initialDocuments={documents} />
}
