import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { activateAnnualCard } from '@/lib/billing/credits'
import { ANNUAL_CARD_PRICE } from '@/lib/billing/config'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// POST /api/billing/annual-card — activate annual card
// TODO: verify WeChat Pay / Alipay payment before activating in production
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await activateAnnualCard(user.id)

  // Record as a transaction note (amount=0, just a log entry)
  const admin = getAdmin()
  const { data: credits } = await admin
    .from('user_credits')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  await admin.from('credit_transactions').insert({
    user_id: user.id,
    amount: 0,
    balance_after: credits?.balance ?? 0,
    description: `开通年卡 ¥${ANNUAL_CARD_PRICE / 100}`,
    metadata: { type: 'annual_card', amount_paid: ANNUAL_CARD_PRICE },
  })

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('user_credits')
    .select('annual_card_expires_at')
    .eq('user_id', user.id)
    .single()

  const expiresAt = data?.annual_card_expires_at
  const active = expiresAt ? new Date(expiresAt) > new Date() : false

  return NextResponse.json({ active, expires_at: expiresAt ?? null })
}
