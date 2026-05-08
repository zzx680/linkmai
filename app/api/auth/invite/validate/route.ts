import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: '请输入邀请码' }, { status: 400 })
  }

  const admin = getAdmin()
  const { data, error } = await admin
    .from('invite_codes')
    .select('code, used')
    .eq('code', code.trim().toUpperCase())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '邀请码无效' }, { status: 400 })
  }
  if (data.used) {
    return NextResponse.json({ error: '该邀请码已被使用' }, { status: 400 })
  }

  return NextResponse.json({ valid: true })
}
