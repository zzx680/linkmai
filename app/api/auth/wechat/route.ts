import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// State store for CSRF protection (in-memory, short TTL)
const stateStore = new Map<string, number>()
const STATE_TTL = 10 * 60 * 1000 // 10 minutes

// Clean up expired states periodically
function pruneStates() {
  const now = Date.now()
  for (const [key, ts] of stateStore) {
    if (now - ts > STATE_TTL) stateStore.delete(key)
  }
}

export function storeState(state: string) {
  pruneStates()
  stateStore.set(state, Date.now())
}

export function consumeState(state: string): boolean {
  const ts = stateStore.get(state)
  if (!ts || Date.now() - ts > STATE_TTL) return false
  stateStore.delete(state)
  return true
}

export async function GET(req: NextRequest) {
  const appId = process.env.WECHAT_APP_ID
  if (!appId) {
    return NextResponse.redirect(new URL('/login?error=wechat_not_configured', req.url))
  }

  const state = crypto.randomBytes(16).toString('hex')
  storeState(state)

  const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/wechat/callback`)
  const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`

  return NextResponse.redirect(url)
}
