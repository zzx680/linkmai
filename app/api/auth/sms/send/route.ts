import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { codeStore } from '../store'

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

  const code = String(Math.floor(100000 + Math.random() * 900000))
  codeStore.set(phone, { code, expires: Date.now() + 5 * 60 * 1000 })

  const accessKeyId = process.env.ALIYUN_SMS_ACCESS_KEY_ID!
  const accessKeySecret = process.env.ALIYUN_SMS_ACCESS_KEY_SECRET!
  const signName = process.env.ALIYUN_SMS_SIGN_NAME!
  const templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE!

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
