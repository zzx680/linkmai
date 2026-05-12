import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', '', { maxAge: 0, path: '/' })
  return res
}
