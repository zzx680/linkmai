import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStoredCode, deleteStoredCode } from '../send/route'

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json()
  if (!phone || !code) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }

  const e164 = `+86${phone}`
  const supabase = await createClient()

  // Try Supabase native OTP verification first
  const { error } = await supabase.auth.verifyOtp({ phone: e164, token: code, type: 'sms' })

  if (!error) {
    return NextResponse.json({ ok: true })
  }

  // If Supabase phone provider not configured, fall back to Aliyun self-verify
  if (error.message.includes('Phone provider') || error.message.includes('phone')) {
    return verifyViaAliyunFallback(phone, code, supabase)
  }

  return NextResponse.json({ error: error.message }, { status: 401 })
}

async function verifyViaAliyunFallback(phone: string, code: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const stored = await getStoredCode(phone)
  if (!stored || stored.code !== code || Date.now() > stored.expires) {
    return NextResponse.json({ error: '验证码错误或已过期' }, { status: 401 })
  }
  await deleteStoredCode(phone)

  // Check if user exists — if so sign in, otherwise sign up
  const e164 = `+86${phone}`
  const tempPassword = crypto.randomUUID()

  const { error: signUpError } = await supabase.auth.signUp({ phone: e164, password: tempPassword })
  if (signUpError && !signUpError.message.includes('already registered') && !signUpError.message.includes('already exists')) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 })
  }

  // Sign in (works for both new and existing users with temp password)
  const { error: signInError } = await supabase.auth.signInWithPassword({ phone: e164, password: tempPassword })
  if (signInError) {
    return NextResponse.json({ error: '登录失败，请使用密码登录或重新获取验证码' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
