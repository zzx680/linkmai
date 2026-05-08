import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addCredits } from '@/lib/billing/credits'
import { TOP_UP_PACKS } from '@/lib/billing/config'

// POST /api/billing/topup
// In production this would integrate with WeChat Pay / Alipay.
// For now: validates the pack, records the transaction, and credits the account.
// Payment verification should happen here before crediting.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { packId } = await req.json()
  const pack = TOP_UP_PACKS.find(p => p.id === packId)
  if (!pack) return NextResponse.json({ error: '无效的充值套餐' }, { status: 400 })

  // TODO: verify payment with WeChat Pay / Alipay before crediting
  // For now, directly credit (dev/demo mode)
  const newBalance = await addCredits(
    user.id,
    pack.totalCredits,
    `充值 ${pack.label}（¥${pack.amount / 100}，赠送 ¥${pack.bonus / 100}）`,
    { packId, amount: pack.amount, bonus: pack.bonus, type: 'topup' }
  )

  return NextResponse.json({ ok: true, balance: newBalance, credited: pack.totalCredits })
}
