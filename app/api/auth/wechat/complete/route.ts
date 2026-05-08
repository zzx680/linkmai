import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createAdminClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(req: NextRequest) {
  const wechatSessionRaw = req.cookies.get('wechat_session')?.value
  if (!wechatSessionRaw) {
    return NextResponse.redirect(new URL('/login?error=wechat_session_expired', req.url))
  }

  let session: { wechat_openid: string; wechat_nickname: string; action: string; created_at: number }
  try {
    session = JSON.parse(wechatSessionRaw)
  } catch {
    return NextResponse.redirect(new URL('/login?error=wechat_auth_failed', req.url))
  }

  const { wechat_openid, wechat_nickname, created_at } = session
  if (!wechat_openid || Date.now() - created_at > 10 * 60 * 1000) {
    return NextResponse.redirect(new URL('/login?error=wechat_session_expired', req.url))
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    // Service role key not configured — WeChat login unavailable
    const response = NextResponse.redirect(new URL('/login?error=wechat_not_configured', req.url))
    response.cookies.delete('wechat_session')
    return response
  }

  const admin = getAdminClient()

  // Look up existing user by wechat_openid stored in user_metadata
  const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const existingUser = listData?.users?.find(
    u => u.user_metadata?.wechat_openid === wechat_openid
  )

  let userId: string

  if (existingUser) {
    userId = existingUser.id
  } else {
    // Create a new user — use a deterministic fake email derived from openid
    // (Supabase requires email or phone; we use a placeholder that won't receive mail)
    const placeholderEmail = `wx_${wechat_openid}@wechat.linkmai.internal`
    const tempPassword = crypto.randomUUID()

    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email: placeholderEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        wechat_openid,
        wechat_nickname,
        display_name: wechat_nickname,
      },
    })

    if (createError || !newUser.user) {
      const response = NextResponse.redirect(new URL('/login?error=wechat_auth_failed', req.url))
      response.cookies.delete('wechat_session')
      return response
    }

    userId = newUser.user.id
  }

  // Generate a magic link token so the user gets a real Supabase session
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: `wx_${wechat_openid}@wechat.linkmai.internal`,
  })

  if (linkError || !linkData?.properties?.hashed_token) {
    const response = NextResponse.redirect(new URL('/login?error=wechat_auth_failed', req.url))
    response.cookies.delete('wechat_session')
    return response
  }

  // Exchange the magic link token for a session via the anon client
  const supabase = await createClient()
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  })

  const response = verifyError
    ? NextResponse.redirect(new URL('/login?error=wechat_auth_failed', req.url))
    : NextResponse.redirect(new URL('/dashboard', req.url))

  response.cookies.delete('wechat_session')
  return response
}
