import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDocumentVersions, saveDocumentVersion } from '@/lib/data/documents'

export async function GET(_: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params
  const versions = await getDocumentVersions(docId)
  return NextResponse.json(versions)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, source, change_note } = await req.json()
  const version = await saveDocumentVersion(docId, content, source, change_note)
  return NextResponse.json(version, { status: 201 })
}
