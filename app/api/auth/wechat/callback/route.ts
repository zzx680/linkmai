import { NextRequest, NextResponse } from 'next/server'
import { consumeState } from '../route'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const action = searchParams.get('action') || 'login'

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=wechat_auth_failed', req.url))
  }

  // Validate state to prevent CSRF
  if (!state || !consumeState(state)) {
    return NextResponse.redirect(new URL('/login?error=wechat_auth_failed', req.url))
  }

  const appId = process.env.WECHAT_APP_ID!
  const appSecret = process.env.WECHAT_APP_SECRET!

  // Exchange code for openid
  const tokenRes = await fetch(
    `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
  )
  const tokenData = await tokenRes.json()
  const openid = tokenData.openid
  const accessToken = tokenData.access_token

  if (!openid) {
    return NextResponse.redirect(new URL('/login?error=wechat_auth_failed', req.url))
  }

  // Get user info from WeChat
  let nickname = '微信用户'
  try {
    const userInfoRes = await fetch(
      `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}`
    )
    if (userInfoRes.ok) {
      const wechatUser = await userInfoRes.json()
      nickname = wechatUser.nickname || '微信用户'
    }
  } catch {}

  // Store WeChat info in a short-lived cookie for the complete step
  const sessionData = {
    wechat_openid: openid,
    wechat_nickname: nickname,
    action,
    created_at: Date.now(),
  }

  const redirectUrl = new URL('/api/auth/wechat/complete', req.url)
  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set('wechat_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
    sameSite: 'lax',
  })

  return response
}
