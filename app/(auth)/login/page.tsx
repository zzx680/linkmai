'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

type Tab = 'wechat' | 'phone' | 'password'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('phone')
  const [agreed, setAgreed] = useState(false)

  // phone tab
  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [smsSent, setSmsSent] = useState(false)
  const [smsCountdown, setSmsCountdown] = useState(0)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  // password tab
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const startCountdown = () => {
    setSmsCountdown(60)
    const t = setInterval(() => {
      setSmsCountdown(n => {
        if (n <= 1) { clearInterval(t); return 0 }
        return n - 1
      })
    }, 1000)
  }

  const handleSendSms = async () => {
    if (!phone || smsCountdown > 0) return
    setPhoneError('')
    setPhoneLoading(true)
    try {
      const res = await fetch('/api/auth/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) { setPhoneError(data.error || '发送失败'); return }
      setSmsSent(true)
      startCountdown()
    } catch {
      setPhoneError('网络错误，请重试')
    } finally {
      setPhoneLoading(false)
    }
  }

  const handlePhoneLogin = async () => {
    if (!agreed) { setPhoneError('请先同意用户协议'); return }
    if (!phone || !smsCode) { setPhoneError('请填写手机号和验证码'); return }
    setPhoneLoading(true)
    setPhoneError('')
    try {
      const res = await fetch('/api/auth/sms/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: smsCode }),
      })
      const data = await res.json()
      if (!res.ok) { setPhoneError(data.error || '验证失败'); return }
      router.push('/cases')
    } catch {
      setPhoneError('网络错误，请重试')
    } finally {
      setPhoneLoading(false)
    }
  }

  const handlePasswordLogin = async () => {
    if (!agreed) { setPwError('请先同意用户协议'); return }
    if (!email || !password) { setPwError('请填写账号和密码'); return }
    setPwLoading(true)
    setPwError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setPwError(error.message); setPwLoading(false) }
    else router.push('/cases')
  }

  const handleWechatLogin = () => {
    if (!agreed) return
    window.location.href = '/api/auth/wechat'
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'phone', label: '手机快捷登录' },
    { key: 'wechat', label: '微信扫码登录' },
    { key: 'password', label: '账号密码登录' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif",
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#000" />
          <path d="M12 28 L20 12 L28 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M15 23 L25 23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="20" cy="12" r="2" fill="white"/>
        </svg>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#000', letterSpacing: '-0.01em' }}>Linkmai</span>
      </div>

      {/* Card */}
      <div style={{
        width: 420,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
        padding: '32px 36px 28px',
      }}>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: 28 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1,
              paddingBottom: 12,
              fontSize: 13,
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? '#000' : '#999',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.key ? '2px solid #000' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
              marginBottom: -1,
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* WeChat tab */}
        {tab === 'wechat' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            {/* QR placeholder */}
            <div style={{
              width: 180, height: 180,
              background: '#f5f5f5',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: '1px solid #ebebeb',
            }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="#ccc" strokeWidth="2"/>
                <rect x="8" y="8" width="8" height="8" fill="#ccc"/>
                <rect x="28" y="4" width="16" height="16" rx="2" stroke="#ccc" strokeWidth="2"/>
                <rect x="32" y="8" width="8" height="8" fill="#ccc"/>
                <rect x="4" y="28" width="16" height="16" rx="2" stroke="#ccc" strokeWidth="2"/>
                <rect x="8" y="32" width="8" height="8" fill="#ccc"/>
                <rect x="28" y="28" width="4" height="4" fill="#ccc"/>
                <rect x="36" y="28" width="4" height="4" fill="#ccc"/>
                <rect x="28" y="36" width="4" height="4" fill="#ccc"/>
                <rect x="36" y="36" width="4" height="4" fill="#ccc"/>
                <rect x="32" y="32" width="4" height="4" fill="#ccc"/>
              </svg>
              <span style={{ fontSize: 11, color: '#bbb' }}>二维码加载中</span>
            </div>

            {/* Mock user */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #e0e0e0, #c8c8c8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#999" strokeWidth="1.5"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#999" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, color: '#666' }}>扫码后自动登录</span>
            </div>

            <button
              onClick={handleWechatLogin}
              disabled={!agreed}
              style={{
                width: '100%', height: 44, borderRadius: 8, border: 'none',
                background: agreed ? '#000' : '#d0d0d0',
                color: '#fff', fontSize: 14, fontWeight: 500,
                cursor: agreed ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              onMouseEnter={e => { if (agreed) e.currentTarget.style.background = '#222' }}
              onMouseLeave={e => { if (agreed) e.currentTarget.style.background = '#000' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9.5 14.5c-3.6 0-6.5-2.4-6.5-5.5S5.9 3.5 9.5 3.5c3.6 0 6.5 2.4 6.5 5.5 0 1-.3 1.9-.8 2.7l.8 2.3-2.5-.8c-.9.5-2 .8-4 .8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M14.5 20.5c-1.2 0-2.3-.3-3.2-.8l-2 .6.6-1.8c-.5-.7-.9-1.5-.9-2.5 0-2.5 2.5-4.5 5.5-4.5s5.5 2 5.5 4.5-2.5 4.5-5.5 4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              微信快捷登录
            </button>
          </div>
        )}

        {/* Phone tab */}
        {tab === 'phone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Phone input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                width: 72, height: 44, borderRadius: 8,
                background: '#f0f0f0', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: '#333', fontWeight: 500, flexShrink: 0,
              }}>
                +86
              </div>
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="请输入手机号"
                style={{
                  flex: 1, height: 44, borderRadius: 8, border: 'none',
                  background: '#f0f0f0', padding: '0 14px',
                  fontSize: 14, color: '#000', outline: 'none',
                }}
              />
            </div>

            {/* SMS code */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text" value={smsCode} onChange={e => setSmsCode(e.target.value)}
                placeholder="请输入验证码"
                maxLength={6}
                style={{
                  flex: 1, height: 44, borderRadius: 8, border: 'none',
                  background: '#f0f0f0', padding: '0 14px',
                  fontSize: 14, color: '#000', outline: 'none',
                }}
              />
              <button
                onClick={handleSendSms}
                disabled={!phone || smsCountdown > 0 || phoneLoading}
                style={{
                  width: 108, height: 44, borderRadius: 8, border: 'none',
                  background: (!phone || smsCountdown > 0) ? '#f0f0f0' : '#000',
                  color: (!phone || smsCountdown > 0) ? '#999' : '#fff',
                  fontSize: 13, fontWeight: 500, cursor: (!phone || smsCountdown > 0) ? 'default' : 'pointer',
                  flexShrink: 0, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (phone && !smsCountdown) e.currentTarget.style.background = '#222' }}
                onMouseLeave={e => { if (phone && !smsCountdown) e.currentTarget.style.background = '#000' }}
              >
                {smsCountdown > 0 ? `${smsCountdown}s 后重发` : '发送验证码'}
              </button>
            </div>

            {phoneError && (
              <p style={{ fontSize: 12, color: '#e53e3e', margin: 0 }}>{phoneError}</p>
            )}

            <button
              onClick={handlePhoneLogin}
              disabled={phoneLoading}
              style={{
                width: '100%', height: 44, borderRadius: 8, border: 'none',
                background: '#000', color: '#fff', fontSize: 14, fontWeight: 500,
                cursor: 'pointer', marginTop: 4, transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#222'}
              onMouseLeave={e => e.currentTarget.style.background = '#000'}
            >
              {phoneLoading ? '登录中...' : '登录'}
            </button>
          </div>
        )}

        {/* Password tab */}
        {tab === 'password' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="邮箱 / 手机号"
              style={{
                height: 44, borderRadius: 8, border: 'none',
                background: '#f0f0f0', padding: '0 14px',
                fontSize: 14, color: '#000', outline: 'none', width: '100%',
              }}
            />

            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="密码"
                style={{
                  height: 44, borderRadius: 8, border: 'none',
                  background: '#f0f0f0', padding: '0 44px 0 14px',
                  fontSize: 14, color: '#000', outline: 'none', width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button" onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: '#999', display: 'flex', alignItems: 'center',
                }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ background: 'none', border: 'none', fontSize: 12, color: '#999', cursor: 'pointer', padding: 0 }}>
                忘记密码？
              </button>
            </div>

            {pwError && (
              <p style={{ fontSize: 12, color: '#e53e3e', margin: 0 }}>{pwError}</p>
            )}

            <button
              onClick={handlePasswordLogin}
              disabled={pwLoading}
              style={{
                width: '100%', height: 44, borderRadius: 8, border: 'none',
                background: '#000', color: '#fff', fontSize: 14, fontWeight: 500,
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#222'}
              onMouseLeave={e => e.currentTarget.style.background = '#000'}
            >
              {pwLoading ? '登录中...' : '登录'}
            </button>
          </div>
        )}

        {/* Agreement */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 24 }}>
          <div
            onClick={() => setAgreed(!agreed)}
            style={{
              width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
              border: agreed ? 'none' : '1.5px solid #ccc',
              background: agreed ? '#000' : 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}>
            {agreed && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <p style={{ fontSize: 11, color: '#999', lineHeight: 1.6, margin: 0 }}>
            我已阅读并同意
            <a href="#" style={{ color: '#555', textDecoration: 'none' }}>《用户服务协议》</a>
            <a href="#" style={{ color: '#555', textDecoration: 'none' }}>《用户隐私协议》</a>
            <a href="#" style={{ color: '#555', textDecoration: 'none' }}>《平台服务协议》</a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 32, fontSize: 11, color: '#bbb', textAlign: 'center' }}>
        © 2026 Linkmai · 灵迈科技 · 沪ICP备XXXXXXXX号
      </p>

    </div>
  )
}
