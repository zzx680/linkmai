import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { password } = await req.json()
  if (!password) return NextResponse.json({ error: '请输入密码确认' }, { status: 400 })

  // Verify password by attempting sign-in
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password,
  })
  if (signInErr) return NextResponse.json({ error: '密码不正确' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Delete all user data (cascade)
  const tables = [
    'credit_transactions',
    'user_credits',
    'material_cells',
    'material_reviews',
    'materials',
    'document_versions',
    'documents',
    'case_deadlines',
    'cases',
    'search_history',
    'conversations',
  ]

  for (const table of tables) {
    await admin.from(table).delete().eq('user_id', user.id)
  }

  // Delete invite codes used by this user
  await admin.from('invite_codes').update({ used: false, used_by: null, used_at: null }).eq('used_by', user.id)

  // Delete the auth user
  const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id)
  if (deleteErr) return NextResponse.json({ error: '账号删除失败：' + deleteErr.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
