import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getActionPrice, type ActionType } from './config'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ── Balance operations ─────────────────────────────────────────────────────────
// All amounts in 分 (integer cents). Never use floats for money.

export async function getBalance(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single()
  return data?.balance ?? 0
}

export async function hasAnnualCard(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_credits')
    .select('annual_card_expires_at')
    .eq('user_id', userId)
    .single()
  if (!data?.annual_card_expires_at) return false
  return new Date(data.annual_card_expires_at) > new Date()
}

export async function hasEnoughBalance(userId: string, minAmount: number): Promise<boolean> {
  const balance = await getBalance(userId)
  return balance >= minAmount
}

// Deduct cost for a single action. Returns cost and new balance.
export async function deductAction(
  userId: string,
  action: ActionType,
  description: string,
  metadata?: Record<string, unknown>
): Promise<{ cost: number; newBalance: number }> {
  const cardActive = await hasAnnualCard(userId)
  const cost = getActionPrice(action, cardActive)

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: cost,
    p_description: description,
    p_metadata: { ...metadata, action, card_price: cardActive },
  })

  if (error) throw new Error(`Credit deduction failed: ${error.message}`)
  return { cost, newBalance: data as number }
}

// Add credits (top-up, welcome bonus, etc.)
export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  metadata?: Record<string, unknown>
): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('add_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    p_metadata: metadata ?? {},
  })

  if (error) throw new Error(`Credit addition failed: ${error.message}`)
  return data as number
}

// Activate annual card for a user — uses service role to bypass RLS
export async function activateAnnualCard(userId: string): Promise<void> {
  const admin = getAdmin()
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const { error } = await admin
    .from('user_credits')
    .update({ annual_card_expires_at: expiresAt.toISOString() })
    .eq('user_id', userId)

  if (error) throw new Error(`Annual card activation failed: ${error.message}`)
}
