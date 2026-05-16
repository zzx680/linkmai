import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin/auth'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function generateCode(): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => CHARS[b % CHARS.length]).join('')
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const admin = getAdmin()
  const { data, error } = await admin
    .from('invite_codes')
    .select('code, used, used_by, used_at, note, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const userIds = (data ?? []).filter(r => r.used_by).map(r => r.used_by as string)
  const emailMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    for (const u of users) {
      if (userIds.includes(u.id)) emailMap[u.id] = u.email ?? u.id
    }
  }

  const enriched = (data ?? []).map(r => ({
    ...r,
    used_by_email: r.used_by ? (emailMap[r.used_by] ?? r.used_by) : null,
  }))

  return NextResponse.json(enriched)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const { note } = await req.json()
  const admin = getAdmin()

  let code = generateCode()
  let attempts = 0
  while (attempts < 10) {
    const { data } = await admin.from('invite_codes').select('code').eq('code', code).single()
    if (!data) break
    code = generateCode()
    attempts++
  }

  const { error } = await admin.from('invite_codes').insert({ code, note: note || null })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ code })
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: '缺少 code' }, { status: 400 })

  const admin = getAdmin()
  const { data } = await admin.from('invite_codes').select('used').eq('code', code).single()
  if (!data) return NextResponse.json({ error: '邀请码不存在' }, { status: 404 })
  if (data.used) return NextResponse.json({ error: '已使用的邀请码不能删除' }, { status: 400 })

  const { error } = await admin.from('invite_codes').delete().eq('code', code)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
