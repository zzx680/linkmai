import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runSearchAgent } from '@/lib/ai/agents/search-agent'
import { hasEnoughBalance, deductAction } from '@/lib/billing/credits'
import { PRICES } from '@/lib/billing/config'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await hasEnoughBalance(user.id, PRICES.SEARCH_CARD))) {
    return NextResponse.json({ error: '余额不足，请充值后继续使用' }, { status: 402 })
  }

  const { query, caseId } = await req.json()

  try {
    const result = await runSearchAgent({ query, caseId })

    await supabase.from('search_history').insert({
      user_id: user.id,
      case_id: caseId || null,
      query,
      intent: query,
      source: process.env.LEGAL_SEARCH_SOURCE || 'bing',
      results: result.results,
    })

    const { cost, newBalance } = await deductAction(
      user.id,
      'search',
      `法律检索 · ${query.slice(0, 30)}`,
      { query, caseId }
    )

    return NextResponse.json({ ...result, billing: { cost, balance: newBalance } })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
