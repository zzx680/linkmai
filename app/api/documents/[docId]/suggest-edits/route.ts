import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLatestVersion } from '@/lib/data/documents'
import { runEditAgent } from '@/lib/ai/agents/edit-agent'

export async function POST(req: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { docId } = await params
    const { instruction } = await req.json()
    if (!instruction?.trim()) {
      return NextResponse.json({ error: 'Missing instruction' }, { status: 400 })
    }

    const version = await getLatestVersion(docId)
    if (!version) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    const result = await runEditAgent({ content: version.content, instruction })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
