import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { name, contact, firm, message } = await req.json()

  if (!name?.trim() || !contact?.trim() || !message?.trim()) {
    return NextResponse.json({ error: '请填写姓名、联系方式和留言' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await admin.from('contact_submissions').insert({
    name: name.trim(),
    contact: contact.trim(),
    firm: firm?.trim() || null,
    message: message.trim(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}