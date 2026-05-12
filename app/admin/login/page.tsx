'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const [secret, setSecret] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    if (!secret) { setError('请输入管理员密码'); return }
    setLoading(true); setError('')

    const r = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    })
    const data = await r.json()
    if (!r.ok) { setError(data.error || '登录失败'); setLoading(false); return }
    router.push('/admin')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f6fa',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif",
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 32 }}>
        <img src="/logo.png" alt="Linkmai" style={{ width: 28, height: 28, filter: 'brightness(0) drop-shadow(0 0 0.5px #000) drop-shadow(0 0 0.5px #000)' }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Linkmai 管理后台</span>
      </div>

      <div style={{
        width: '100%', maxWidth: 380,
        background: '#fff', borderRadius: 14,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        padding: '32px 36px 28px',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 24 }}>管理员登录</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={secret}
              onChange={e => setSecret(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="管理员密码"
              style={{ height: 44, borderRadius: 8, border: 'none', background: '#f0f2f5', padding: '0 44px 0 14px', fontSize: 14, color: '#111', outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#999', display: 'flex', alignItems: 'center' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}

          <button onClick={handleLogin} disabled={loading}
            style={{ width: '100%', height: 44, borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />登录中...</> : '登录'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
