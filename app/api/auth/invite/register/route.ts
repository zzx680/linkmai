import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClientForResponse } from '@/lib/supabase/response'

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

  // 验证邀请码
  const { data: invite, error: inviteErr } = await admin
    .from('invite_codes')
    .select('code, used')
    .eq('code', code.trim().toUpperCase())
    .single()

  if (inviteErr || !invite) {
    return NextResponse.json({ error: '邀请码无效' }, { status: 400 })
  }
  if (invite.used) {
    return NextResponse.json({ error: '该邀请码已被使用' }, { status: 409 })
  }

  const e164 = `+86${phone}`

  // 创建用户
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    phone: e164,
    password,
    phone_confirm: true,
  })

  if (createErr) {
    if (createErr.message.includes('already registered') || createErr.message.includes('already exists')) {
      // 手机号已注册，直接登录
      const res = NextResponse.json({ ok: true })
      const supabase = createClientForResponse(req, res)
      const { error: signInErr } = await supabase.auth.signInWithPassword({ phone: e164, password })
      if (signInErr) return NextResponse.json({ error: '手机号已注册，密码错误' }, { status: 401 })
      return res
    }
    return NextResponse.json({ error: createErr.message }, { status: 400 })
  }

  // 标记邀请码已使用
  await admin
    .from('invite_codes')
    .update({ used: true, used_by: created.user.id, used_at: new Date().toISOString() })
    .eq('code', invite.code)

  // 注册成功后自动登录，写入 session cookie
  const res = NextResponse.json({ ok: true })
  const supabase = createClientForResponse(req, res)
  await supabase.auth.signInWithPassword({ phone: e164, password })

  return res
}
