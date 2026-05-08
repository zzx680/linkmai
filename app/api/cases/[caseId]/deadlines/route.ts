import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDeadlinesByCaseId, createDeadline } from '@/lib/data/deadlines'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { caseId } = await params
  try {
    const deadlines = await getDeadlinesByCaseId(caseId)
    return NextResponse.json(deadlines)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { caseId } = await params
  const body = await req.json()
  const { title, due_date } = body
  if (!title || !due_date) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  try {
    const deadline = await createDeadline({ case_id: caseId, title, due_date })
    return NextResponse.json(deadline, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
