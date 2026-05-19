'use client'

import { useState, useEffect, Suspense } from 'react'
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
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('invite') === 'true') setShowInviteRegister(true)
  }, [searchParams])

  const handlePasswordLogin = async () => {
    if (!agreed) { setPwError('请先同意用户协议'); return }
    if (!account || !password) { setPwError('请填写账号和密码'); return }

    // 管理员入口
    if (account.trim().toLowerCase() === 'hk.charlie@163.com') {
      router.push('/admin/login')
      return
    }

    if (!/^1[3-9]\d{9}$/.test(account)) {
      setPwError('请输入正确的手机号')
      return
    }

    setPwLoading(true); setPwError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: account.trim(), password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setPwError(data.error || '登录失败')
      setPwLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f6fa',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif",
      padding: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 32 }}>
        <img src="/logo.png" alt="Linkmai" style={{ width: 30, height: 30, filter: 'brightness(0) drop-shadow(0 0 0.5px #000) drop-shadow(0 0 0.5px #000)' }} />
        <span style={{ fontSize: 18, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>LinkMai</span>
      </div>

      <div style={{
        width: '100%', maxWidth: 400,
        background: '#fff', borderRadius: 14,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        padding: '32px 36px 28px',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 24 }}>登录</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="tel"
            value={account}
            onChange={e => setAccount(e.target.value.replace(/\D/g, '').slice(0, 11))}
            onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
            placeholder="手机号"
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
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#999', display: 'flex', alignItems: 'center' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Agreement */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div onClick={() => setAgreed(!agreed)} style={{
              width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${agreed ? '#111' : '#ccc'}`,
              background: agreed ? '#111' : '#fff', cursor: 'pointer', flexShrink: 0, marginTop: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {agreed && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            <span style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
              我已阅读并同意<a href="#" style={{ color: '#555', textDecoration: 'none' }}>《用户服务协议》</a>和<a href="/privacy" target="_blank" style={{ color: '#555', textDecoration: 'none' }}>《隐私政策》</a>
            </span>
          </div>

          {pwError && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{pwError}</p>}

          <button onClick={handlePasswordLogin} disabled={pwLoading}
            style={{ width: '100%', height: 44, borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 500, cursor: pwLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {pwLoading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />登录中...</> : '登录'}
          </button>

          <div style={{ textAlign: 'center', paddingTop: 4 }}>
            <button onClick={() => setShowInviteRegister(true)}
              style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>
              使用邀请码注册
            </button>
          </div>
        </div>
      </div>

      {showInviteRegister && <InviteRegisterModal onClose={() => setShowInviteRegister(false)} />}
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
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [code, setCode] = useState('')
  const [phone, setPhone] = useState('')
  const [pw, setPw] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()

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
    if (!/^1[3-9]\d{9}$/.test(phone)) { setError('请输入正确的手机号'); return }
    if (pw.length < 6) { setError('密码至少 6 位'); return }
    if (pw !== pwConfirm) { setError('两次密码不一致'); return }
    setLoading(true); setError('')

    const res = await fetch('/api/auth/invite/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim(), phone: phone.trim(), password: pw }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || '注册失败'); setLoading(false); return }
    setLoading(false)
    setStep(3)
  }

  const handleSetName = async () => {
    if (!name.trim()) { setError('请输入您的称呼'); return }
    setLoading(true); setError('')

    const res = await fetch('/api/auth/update-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || '设置失败'); setLoading(false); return }

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
              {step === 1 ? '输入邀请码' : step === 2 ? '设置账号' : '您的称呼'}
            </h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f5f5f8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, padding: '14px 28px 0' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ height: 3, flex: 1, borderRadius: 2, background: s <= step ? '#111' : '#e0e0e8', transition: 'background 0.2s' }} />
          ))}
        </div>

        <div style={{ padding: '20px 28px 28px' }}>

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
                autoFocus
                style={{ height: 44, borderRadius: 8, border: 'none', background: '#f0f2f5', padding: '0 14px', fontSize: 15, color: '#111', outline: 'none', width: '100%', boxSizing: 'border-box' as const, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' as const }}
              />
              {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
              <button onClick={handleValidateCode} disabled={loading}
                style={{ width: '100%', height: 44, borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />验证中...</> : '验证邀请码'}
              </button>
            </div>
          )}

          {/* Step 2: Phone + password */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, color: '#888', margin: 0 }}>邀请码验证通过，设置你的账号信息。</p>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="手机号"
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div onClick={() => setAgreed(!agreed)} style={{
                  width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${agreed ? '#111' : '#ccc'}`,
                  background: agreed ? '#111' : '#fff', cursor: 'pointer', flexShrink: 0, marginTop: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {agreed && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <span style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
                  我已阅读并同意<a href="#" style={{ color: '#555', textDecoration: 'none' }}>《用户服务协议》</a>和<a href="/privacy" target="_blank" style={{ color: '#555', textDecoration: 'none' }}>《隐私政策》</a>
                </span>
              </div>
              {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
              <button onClick={handleRegister} disabled={loading}
                style={{ width: '100%', height: 44, borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />注册中...</> : '下一步'}
              </button>
            </div>
          )}

          {/* Step 3: Name */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 13, color: '#888', margin: 0 }}>我该如何称呼您？这将作为您的账户名称。</p>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSetName()}
                placeholder="例如：宋律师"
                autoFocus
                maxLength={20}
                style={{ height: 44, borderRadius: 8, border: 'none', background: '#f0f2f5', padding: '0 14px', fontSize: 14, color: '#111', outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
              />
              {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
              <button onClick={handleSetName} disabled={loading}
                style={{ width: '100%', height: 44, borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />进入中...</> : '开始使用'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
