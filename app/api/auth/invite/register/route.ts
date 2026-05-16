import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const { code, phone, password } = await req.json()

  if (!code || !phone || !password) {
    return NextResponse.json({ error: '参数不完整' }, { status: 400 })
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: '手机号格式不正确' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 })
  }

  const admin = getAdmin()

  // Re-validate code atomically
  const { data: invite, error: inviteErr } = await admin
    .from('invite_codes')
    .select('code, used')
    .eq('code', code.trim().toUpperCase())
    .single()

  if (inviteErr || !invite) {
    return NextResponse.json({ error: '邀请码无效' }, { status: 400 })
  }
  if (invite.used) {
    return NextResponse.json({ error: '该邀请码已被使用' }, { status: 400 })
  }

  const e164 = `+86${phone}`

  // Create user with phone
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    phone: e164,
    password,
    phone_confirm: true,
  })

  if (createErr) {
    if (createErr.message.includes('already registered') || createErr.message.includes('already exists')) {
      return NextResponse.json({ error: '该手机号已注册' }, { status: 409 })
    }
    return NextResponse.json({ error: createErr.message }, { status: 400 })
  }

  const userId = created.user.id

  // Mark invite code as used
  await admin
    .from('invite_codes')
    .update({ used: true, used_by: userId, used_at: new Date().toISOString() })
    .eq('code', invite.code)

  return NextResponse.json({ ok: true })
}
