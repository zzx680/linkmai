import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function requireAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.user_metadata?.is_admin) return null
  return user
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const admin = getAdmin()

  const [{ data: { users } }, { data: credits }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('user_credits').select('user_id, balance, annual_card_expires_at'),
  ])

  const creditMap: Record<string, { balance: number; annual_card_expires_at: string | null }> = {}
  for (const c of credits ?? []) {
    creditMap[c.user_id] = { balance: c.balance, annual_card_expires_at: c.annual_card_expires_at }
  }

  const result = users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    balance: creditMap[u.id]?.balance ?? 0,
    annual_card_expires_at: creditMap[u.id]?.annual_card_expires_at ?? null,
    is_admin: u.user_metadata?.is_admin ?? false,
  }))

  return NextResponse.json(result)
}
