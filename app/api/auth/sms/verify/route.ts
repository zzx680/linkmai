import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { codeStore } from '../store'

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json()
  if (!phone || !code) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }

  const stored = codeStore.get(phone)
  if (!stored || stored.code !== code || Date.now() > stored.expires) {
    return NextResponse.json({ error: '验证码错误或已过期' }, { status: 401 })
  }
  codeStore.delete(phone)

  const supabase = await createClient()

  // Upsert user by phone
  const { data, error } = await supabase.auth.admin.createUser({
    phone,
    phone_otp: code,
    email_confirm: true,
    user_metadata: { phone },
  } as any)

  if (error) {
    // If admin API unavailable, try signInWithOtp
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone })
    if (otpError) {
      return NextResponse.json({ error: otpError.message }, { status: 401 })
    }
  }

  return NextResponse.json({ ok: true })
}
