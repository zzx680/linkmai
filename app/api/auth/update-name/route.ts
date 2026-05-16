import { NextRequest, NextResponse } from 'next/server'
import { createClientForResponse } from '@/lib/supabase/response'

export async function POST(req: NextRequest) {
  const { name } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: '请输入称呼' }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true })
  const supabase = createClientForResponse(req, res)

  const { error } = await supabase.auth.updateUser({
    data: { full_name: name.trim() },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return res
}
