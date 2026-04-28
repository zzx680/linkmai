import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect('/login?error=wechat_auth_failed')
  }

  const appId = process.env.WECHAT_APP_ID!
  const appSecret = process.env.WECHAT_APP_SECRET!

  // Exchange code for openid
  const tokenRes = await fetch(
    `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
  )
  const tokenData = await tokenRes.json()
  const openid = tokenData.openid

  if (!openid) {
    return NextResponse.redirect('/login?error=wechat_auth_failed')
  }

  const supabase = await createClient()

  // Try to sign in/up with WeChat openid
  const { data: { user }, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: code, // placeholder — swap to custom WeChat provider below
  } as any)

  // NOTE: Supabase doesn't natively support WeChat.
  // Option A: use the WeChat openid to upsert into a custom users table,
  // then mint a custom JWT session.
  // Option B: set up a custom Supabase auth extension / Edge Function.
  // For now we redirect to cases and set a cookie with openid so
  // the middleware can hydrate the session.
  const response = NextResponse.redirect(new URL('/cases', req.url))
  response.cookies.set('wechat_openid', openid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return response
}
