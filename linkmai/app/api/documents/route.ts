import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDocumentsByCase, createDocument } from '@/lib/data/documents'

export async function GET(req: NextRequest) {
  const caseId = req.nextUrl.searchParams.get('caseId')
  if (!caseId) return NextResponse.json({ error: 'caseId required' }, { status: 400 })
  const docs = await getDocumentsByCase(caseId)
  return NextResponse.json(docs)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const doc = await createDocument(body)
  return NextResponse.json(doc, { status: 201 })
}
