import { NextRequest, NextResponse } from 'next/server'
import { createClientForResponse } from '@/lib/supabase/response'

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
    phone: `+86${phone}`,
    password,
  })

  if (error) {
    return NextResponse.json({ error: '手机号或密码错误' }, { status: 401 })
  }

  return res
}
