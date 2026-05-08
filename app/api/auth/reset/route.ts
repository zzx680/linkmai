import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStoredCode, deleteStoredCode } from '../sms/send/route'

// POST /api/auth/reset — Reset password via phone OTP
export async function POST(req: NextRequest) {
  const { phone, code, newPassword } = await req.json()

  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: '手机号格式不正确' }, { status: 400 })
  }

  const e164 = `+86${phone}`
  const supabase = await createClient()

  // Step 1: Send reset code (no code provided)
  if (!code) {
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 })
    if (error) {
      // If Supabase phone provider not configured, use Aliyun fallback
      // The /api/auth/sms/send endpoint handles that — redirect caller there
      return NextResponse.json({ error: '请通过发送验证码接口获取验证码' }, { status: 400 })
    }
    return NextResponse.json({ ok: true, message: '验证码已发送' })
  }

  // Step 2: Verify code and reset password
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: '新密码至少 6 位' }, { status: 400 })
  }

  // Verify OTP
  const { error: verifyError } = await supabase.auth.verifyOtp({ phone: e164, token: code, type: 'sms' })
  if (verifyError) {
    // Try Aliyun fallback
    const stored = await getStoredCode(phone)
    if (!stored || stored.code !== code || Date.now() > stored.expires) {
      return NextResponse.json({ error: '验证码错误或已过期' }, { status: 401 })
    }
    await deleteStoredCode(phone)

    // Sign in with temp approach, then update password
    const tempPw = crypto.randomUUID()
    const { error: signInErr } = await supabase.auth.signInWithPassword({ phone: e164, password: tempPw })
    if (signInErr) {
      return NextResponse.json({ error: '验证失败，请重新获取验证码' }, { status: 401 })
    }
  }

  // User is now authenticated — update password
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
