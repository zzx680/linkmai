import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

// ── Rate limiting (in-memory, per-instance) ──────────────────────────────────
const sendLimits = new Map<string, { count: number; resetAt: number }>()
const MAX_SENDS_PER_HOUR = 5

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = sendLimits.get(key)
  if (!entry || now > entry.resetAt) {
    sendLimits.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }
  if (entry.count >= MAX_SENDS_PER_HOUR) return false
  entry.count++
  return true
}

// ── Aliyun SMS signing ───────────────────────────────────────────────────────
function sign(params: Record<string, string>, secret: string) {
  const sorted = Object.keys(params).sort().map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&')
  const str = `POST&${encodeURIComponent('/')}&${encodeURIComponent(sorted)}`
  return crypto.createHmac('sha1', secret + '&').update(str).digest('base64')
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json()
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: '手机号格式不正确' }, { status: 400 })
  }

  // Rate limit by phone + IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(`phone:${phone}`) || !checkRateLimit(`ip:${ip}`)) {
    return NextResponse.json({ error: '发送过于频繁，请稍后再试' }, { status: 429 })
  }

  // Use Supabase native phone OTP
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({ phone: `+86${phone}` })

  if (error) {
    // If Supabase phone provider is not configured, fall back to Aliyun SMS + self-verify
    if (error.message.includes('Phone provider') || error.message.includes('phone')) {
      return sendViaAliyun(phone)
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// ── Fallback: Aliyun SMS with in-memory OTP ──────────────────────────────────
// Used when Supabase phone provider is not configured (dev / early setup)
const codeStore = new Map<string, { code: string; expires: number }>()

async function sendViaAliyun(phone: string) {
  const accessKeyId = process.env.ALIYUN_SMS_ACCESS_KEY_ID
  const accessKeySecret = process.env.ALIYUN_SMS_ACCESS_KEY_SECRET
  const signName = process.env.ALIYUN_SMS_SIGN_NAME
  const templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE

  if (!accessKeyId || !accessKeySecret || !signName || !templateCode) {
    // Dev fallback: log code to console instead of sending SMS
    const code = String(Math.floor(100000 + Math.random() * 900000))
    codeStore.set(phone, { code, expires: Date.now() + 5 * 60 * 1000 })
    console.log(`[DEV] SMS code for ${phone}: ${code}`)
    return NextResponse.json({ ok: true, _dev_code: process.env.NODE_ENV === 'development' ? code : undefined })
  }

  const code = String(Math.floor(100000 + Math.random() * 900000))
  codeStore.set(phone, { code, expires: Date.now() + 5 * 60 * 1000 })

  const params: Record<string, string> = {
    AccessKeyId: accessKeyId,
    Action: 'SendSms',
    Format: 'JSON',
    PhoneNumbers: phone,
    SignName: signName,
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: crypto.randomUUID(),
    SignatureVersion: '1.0',
    TemplateCode: templateCode,
    TemplateParam: JSON.stringify({ code }),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Version: '2017-05-25',
  }
  params.Signature = sign(params, accessKeySecret)

  const body = Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
  const res = await fetch('https://dysmsapi.aliyuncs.com/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (data.Code !== 'OK') {
    return NextResponse.json({ error: data.Message || '发送失败' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// Exported for verify route (Aliyun fallback only)
export { codeStore }
