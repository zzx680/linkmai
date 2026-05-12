import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { secret } = await req.json()
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: '密码错误' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return res
}
