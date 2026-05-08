import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { codeStore } from '../sms/send/route'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { phone, code, password } = body

  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: '手机号格式不正确' }, { status: 400 })
  }

  const supabase = await createClient()
  const e164 = `+86${phone}`

  // ── 手机号 + 密码注册 ──────────────────────────────────────────────────────
  if (password) {
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 })
    }
    const { error } = await supabase.auth.signUp({ phone: e164, password })
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return NextResponse.json({ error: '该手机号已注册，请直接登录' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  }

  // ── 手机号 + 验证码注册 ────────────────────────────────────────────────────
  if (!code) {
    return NextResponse.json({ error: '缺少验证码' }, { status: 400 })
  }

  // Try Supabase native OTP first
  const { error: otpError } = await supabase.auth.verifyOtp({ phone: e164, token: code, type: 'sms' })
  if (!otpError) {
    return NextResponse.json({ ok: true })
  }

  // Fallback to Aliyun self-verify
  if (otpError.message.includes('Phone provider') || otpError.message.includes('phone')) {
    const stored = codeStore.get(phone)
    if (!stored || stored.code !== code || Date.now() > stored.expires) {
      return NextResponse.json({ error: '验证码错误或已过期' }, { status: 401 })
    }
    codeStore.delete(phone)

    const tempPassword = crypto.randomUUID()
    const { error: signUpError } = await supabase.auth.signUp({ phone: e164, password: tempPassword })
    if (signUpError && !signUpError.message.includes('already registered') && !signUpError.message.includes('already exists')) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ phone: e164, password: tempPassword })
    if (signInError) {
      return NextResponse.json({ error: '注册成功，请使用验证码登录' }, { status: 200 })
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: otpError.message }, { status: 401 })
}
