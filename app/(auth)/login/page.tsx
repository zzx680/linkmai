'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, X, Loader2, ArrowLeft } from 'lucide-react'

function LoginPageInner() {
  const [showPw, setShowPw] = useState(false)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [showInviteRegister, setShowInviteRegister] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('invite') === 'true') setShowInviteRegister(true)
    const error = searchParams.get('error')
    if (error) setPwError(getErrorMessage(error))
  }, [searchParams])

  const getErrorMessage = (key: string) => {
    const map: Record<string, string> = {
      wechat_auth_failed: '微信登录失败，请重试',
      wechat_session_expired: '微信登录已超时，请重新扫码',
      wechat_not_configured: '微信登录暂未开放，请使用其他方式',
    }
    return map[key] || '登录出错，请重试'
  }

  const handlePasswordLogin = async () => {
    if (!agreed) { setPwError('请先同意用户协议'); return }
    if (!account || !password) { setPwError('请填写账号和密码'); return }

    // 管理员入口：特定邮箱直接跳转管理后台登录页
    if (account.trim().toLowerCase() === 'hk.charlie@163.com') {
      router.push('/admin/login')
      return
    }

    setPwLoading(true); setPwError('')
    const isPhone = /^1[3-9]\d{9}$/.test(account)
    const { data, error } = isPhone
      ? await supabase.auth.signInWithPassword({ phone: account, password })
      : await supabase.auth.signInWithPassword({ email: account, password })
    if (error) { setPwError(error.message); setPwLoading(false) }
    else if (data.user?.user_metadata?.is_admin) router.push('/admin')
    else router.push('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f6fa',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif",
      padding: '20px',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 32 }}>
        <img src="/logo.png" alt="Linkmai" style={{ width: 30, height: 30, filter: 'brightness(0) drop-shadow(0 0 0.5px #000) drop-shadow(0 0 0.5px #000)' }} />
        <span style={{ fontSize: 18, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>LinkMai</span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#fff', borderRadius: 14,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        padding: '32px 36px 28px',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 24 }}>账号密码登录</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            value={account}
            onChange={e => setAccount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
            placeholder="邮箱"
            style={{ height: 44, borderRadius: 8, border: 'none', background: '#f0f2f5', padding: '0 14px', fontSize: 14, color: '#111', outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
              placeholder="密码"
              style={{ height: 44, borderRadius: 8, border: 'none', background: '#f0f2f5', padding: '0 44px 0 14px', fontSize: 14, color: '#111', outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#999', display: 'flex', alignItems: 'center' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowReset(true)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#2563eb', cursor: 'pointer', padding: 0 }}>忘记密码？</button>
          </div>
          {pwError && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{pwError}</p>}
          <button
            onClick={handlePasswordLogin}
            disabled={pwLoading}
            style={{ width: '100%', height: 44, borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 500, cursor: pwLoading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onMouseEnter={e => { if (!pwLoading) e.currentTarget.style.background = '#333' }}
            onMouseLeave={e => { if (!pwLoading) e.currentTarget.style.background = '#111' }}
          >
            {pwLoading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />登录中...</> : '登录'}
          </button>
        </div>

        {/* Agreement */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 20 }}>
          <div onClick={() => setAgreed(!agreed)} style={{
            width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
            border: agreed ? 'none' : '1.5px solid #d0d0d0',
            background: agreed ? '#111' : 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            {agreed && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <p style={{ fontSize: 11, color: '#aaa', lineHeight: 1.6, margin: 0 }}>
            我已阅读并同意
            <a href="#" style={{ color: '#555', textDecoration: 'none' }}>《用户服务协议》</a>和
            <a href="#" style={{ color: '#555', textDecoration: 'none' }}>《隐私政策》</a>
          </p>
        </div>

        {/* Register link */}
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#888' }}>
          内测中 ·{' '}
          <button
            onClick={() => setShowInviteRegister(true)}
            style={{ background: 'none', border: 'none', fontSize: 13, color: '#2563eb', cursor: 'pointer', fontWeight: 500, padding: 0 }}
          >
            使用邀请码注册
          </button>
        </p>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 32, fontSize: 11, color: '#ccc', textAlign: 'center' }}>
        © 2026 LinkMai · 沪ICP备XXXXXXXX号
      </p>

      {showInviteRegister && <InviteRegisterModal onClose={() => setShowInviteRegister(false)} />}
      {showReset && <ResetModal onClose={() => setShowReset(false)} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  )
}

// ─── Invite Register Modal ────────────────────────────────────────────────────

function InviteRegisterModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleValidateCode = async () => {
    if (!code.trim()) { setError('请输入邀请码'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/auth/invite/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || '邀请码无效'); setLoading(false); return }
    setStep(2)
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!agreed) { setError('请先同意用户协议'); return }
    if (!email.trim()) { setError('请输入邮箱'); return }
    if (pw.length < 6) { setError('密码至少 6 位'); return }
    if (pw !== pwConfirm) { setError('两次密码不一致'); return }
    setLoading(true); setError('')

    const res = await fetch('/api/auth/invite/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim(), email: email.trim(), password: pw }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || '注册失败'); setLoading(false); return }

    // Auto sign-in after registration
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw })
    if (signInErr) { setError('注册成功，请手动登录'); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {step === 2 && (
              <button onClick={() => { setStep(1); setError('') }} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#f5f5f8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                <ArrowLeft size={14} />
              </button>
            )}
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>
              {step === 1 ? '输入邀请码' : '设置账号'}
            </h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f5f5f8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, padding: '14px 28px 0', alignItems: 'center' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ height: 3, flex: 1, borderRadius: 2, background: s <= step ? '#111' : '#e0e0e8', transition: 'background 0.2s' }} />
          ))}
        </div>

        <div style={{ padding: '24px 28px 24px' }}>

          {/* Step 1: Invite code */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Linkmai 目前处于内测阶段，需要邀请码才能注册。</p>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleValidateCode()}
                placeholder="请输入邀请码"
                maxLength={12}
                style={{ height: 44, borderRadius: 8, border: 'none', background: '#f0f2f5', padding: '0 14px', fontSize: 15, color: '#111', outline: 'none', width: '100%', boxSizing: 'border-box' as const, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' as const }}
              />
              {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
              <button
                onClick={handleValidateCode}
                disabled={loading}
                style={{ width: '100%', height: 44, borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />验证中...</> : '验证邀请码'}
              </button>
            </div>
          )}

          {/* Step 2: Email + password */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, color: '#888', margin: 0 }}>邀请码验证通过，设置你的账号信息。</p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="邮箱地址"
                style={{ height: 44, borderRadius: 8, border: 'none', background: '#f0f2f5', padding: '0 14px', fontSize: 14, color: '#111', outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
              />
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="设置密码（至少 6 位）"
                  style={{ height: 44, borderRadius: 8, border: 'none', background: '#f0f2f5', padding: '0 44px 0 14px', fontSize: 14, color: '#111', outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#999', display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <input
                type="password"
                value={pwConfirm}
                onChange={e => setPwConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                placeholder="确认密码"
                style={{ height: 44, borderRadius: 8, border: 'none', background: '#f0f2f5', padding: '0 14px', fontSize: 14, color: '#111', outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
              />

              {/* Agreement */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div onClick={() => setAgreed(!agreed)} style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  border: agreed ? 'none' : '1.5px solid #d0d0d0',
                  background: agreed ? '#111' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {agreed && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <p style={{ fontSize: 11, color: '#aaa', lineHeight: 1.6, margin: 0 }}>
                  我已阅读并同意<a href="#" style={{ color: '#555', textDecoration: 'none' }}>《用户服务协议》</a>和<a href="#" style={{ color: '#555', textDecoration: 'none' }}>《隐私政策》</a>
                </p>
              </div>

              {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
              <button
                onClick={handleRegister}
                disabled={loading}
                style={{ width: '100%', height: 44, borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />注册中...</> : '完成注册'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────

function ResetModal({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [newPw, setNewPw] = useState('')
  const [smsCountdown, setSmsCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const startCountdown = () => {
    setSmsCountdown(60)
    const t = setInterval(() => {
      setSmsCountdown(n => { if (n <= 1) { clearInterval(t); return 0 }; return n - 1 })
    }, 1000)
  }

  const handleSendSms = async () => {
    if (!phone || smsCountdown > 0) return
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/sms/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '发送失败'); return }
      startCountdown()
    } catch { setError('网络错误，请重试') }
    finally { setLoading(false) }
  }

  const handleReset = async () => {
    if (!phone || !smsCode || !newPw) { setError('请填写所有字段'); return }
    if (newPw.length < 6) { setError('新密码至少 6 位'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: smsCode, newPassword: newPw }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '重置失败'); return }
      setSuccess(true)
    } catch { setError('网络错误，请重试') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px 0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>重置密码</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f5f5f8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '24px 28px 20px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: 14, color: '#111', marginBottom: 16 }}>密码已重置成功</p>
              <button onClick={onClose} style={{ height: 42, padding: '0 32px', borderRadius: 10, background: '#111', color: '#fff', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                返回登录
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 72, height: 44, borderRadius: 8, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#555', fontWeight: 500, flexShrink: 0 }}>+86</div>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="注册时的手机号"
                  style={{ flex: 1, height: 44, borderRadius: 8, border: 'none', background: '#f0f2f5', padding: '0 14px', fontSize: 14, color: '#111', outline: 'none', width: '100%', boxSizing: 'border-box' as const }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={smsCode} onChange={e => setSmsCode(e.target.value)} placeholder="验证码" maxLength={6}
                  style={{ flex: 1, height: 44, borderRadius: 8, border: 'none', background: '#f0f2f5', padding: '0 14px', fontSize: 14, color: '#111', outline: 'none', width: '100%', boxSizing: 'border-box' as const }} />
                <button onClick={handleSendSms} disabled={!phone || smsCountdown > 0 || loading}
                  style={{ width: 112, height: 44, borderRadius: 8, border: 'none', background: (!phone || smsCountdown > 0) ? '#f0f2f5' : '#111', color: (!phone || smsCountdown > 0) ? '#999' : '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                  {smsCountdown > 0 ? `${smsCountdown}s` : '发送验证码'}
                </button>
              </div>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="设置新密码（至少 6 位）"
                style={{ height: 44, borderRadius: 8, border: 'none', background: '#f0f2f5', padding: '0 14px', fontSize: 14, color: '#111', outline: 'none', width: '100%', boxSizing: 'border-box' as const }} />
              {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
              <button onClick={handleReset} disabled={loading}
                style={{ width: '100%', height: 44, borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                {loading ? '重置中...' : '重置密码'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
