import { NextRequest, NextResponse } from 'next/server'
import { createClientForResponse } from '@/lib/supabase/response'

function phoneToEmail(phone: string) {
  return `${phone}@sms.linkmai.com`
}

export async function POST(req: NextRequest) {
  const { phone, password } = await req.json()

  if (!phone || !password) {
    return NextResponse.json({ error: '请填写手机号和密码' }, { status: 400 })
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: '手机号格式不正确' }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true })
  const supabase = createClientForResponse(req, res)

  const { error } = await supabase.auth.signInWithPassword({
    email: phoneToEmail(phone),
    password,
  })

  if (error) {
    return NextResponse.json({
      error: '手机号或密码错误',
      _debug: error.message,
      _url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'MISSING',
    }, { status: 401 })
  }

  return res
}
