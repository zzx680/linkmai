import { NextRequest, NextResponse } from 'next/server'
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
  const { data, error } = await admin
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const { id, status, reply_note } = await req.json()
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 })

  const admin = getAdmin()
  const updates: Record<string, unknown> = { status }
  if (reply_note !== undefined) updates.reply_note = reply_note
  if (status === 'replied') updates.replied_at = new Date().toISOString()

  const { error } = await admin
    .from('contact_submissions')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}