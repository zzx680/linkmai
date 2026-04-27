import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runSearchAgent } from '@/lib/ai/agents/search-agent'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { query, caseId } = await req.json()

  try {
    const result = await runSearchAgent({ query, caseId })

    // Save to search history
    await supabase.from('search_history').insert({
      user_id: user.id,
      case_id: caseId || null,
      query,
      intent: query,
      source: process.env.LEGAL_SEARCH_SOURCE || 'bing',
      results: result.results,
    })

    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
