'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('两次输入的密码不一致'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/cases')
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ── */}
      <div className="hidden md:flex w-[46%] relative flex-col justify-between overflow-hidden"
        style={{ background: 'var(--bg-base)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{
            position: 'absolute', top: '-10%', right: '-8%',
            width: '55%', height: '55%',
            background: 'linear-gradient(135deg, rgba(55,122,255,0.12), rgba(107,158,255,0.06))',
            borderRadius: '50%', filter: 'blur(60px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '5%', left: '-10%',
            width: '45%', height: '45%',
            background: 'linear-gradient(135deg, rgba(55,122,255,0.08), rgba(107,158,255,0.03))',
            borderRadius: '50%', filter: 'blur(50px)',
          }} />
          <div className="absolute" style={{
            top: '22%', right: '8%',
            width: 180, height: 90,
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.6)',
          }} />
          <div className="absolute" style={{
            bottom: '28%', left: '5%',
            width: 160, height: 80,
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            borderRadius: 14,
            boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,255,255,0.5)',
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full p-16">
          <div className="flex items-center gap-3 animate-blur-in">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #377AFF, #6b9eff)', boxShadow: '0 4px 16px rgba(55,122,255,0.3)' }}>
              <span className="text-white font-bold text-base tracking-wide">L</span>
            </div>
            <span className="text-base font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>LinkMai</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-bold leading-tight tracking-tight animate-fade-up"
              style={{
                background: 'linear-gradient(135deg, #377AFF 0%, #6b9eff 50%, #377AFF 100%)',
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
              法有据 · 智无界
            </h1>
            <p className="text-base animate-fade-up stagger-1" style={{ color: 'var(--text-secondary)' }}>
              AI 驱动的律师工作平台
            </p>
            <div className="space-y-3 pt-4 animate-fade-up stagger-2">
              {['文书智能起草', '案件流程管理', '法条数据库检索'].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-500)' }} />
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs animate-fade-up stagger-3" style={{ color: 'var(--text-tertiary)' }}>
            &copy; 2026 LinkMai · 法律 AI 工作平台
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-surface)' }}>
        <div className="w-full max-w-[400px] px-10">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #377AFF, #6b9eff)', boxShadow: '0 3px 12px rgba(55,122,255,0.25)' }}>
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>LinkMai</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>创建账户</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>开始使用 AI 法律工作平台</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>邮箱地址</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--text-tertiary)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="input-base" style={{ paddingLeft: 40, height: 48 }}
                  placeholder="your@email.com" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>密码</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="input-base" style={{ paddingLeft: 40, paddingRight: 44, height: 48 }}
                  placeholder="设置密码，至少 6 位"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md"
                  style={{ color: 'var(--text-tertiary)' }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>确认密码</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--text-tertiary)' }} />
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                  className="input-base" style={{ paddingLeft: 40, height: 48 }}
                  placeholder="再次输入密码" />
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm"
                style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(220,38,38,0.12)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full" style={{ height: 48, marginTop: 4 }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent spin"
                    style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
                  创建中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  创建账户
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
            已有账户？
            <Link href="/login" className="font-medium ml-1" style={{ color: 'var(--accent-500)' }}>
              立即登录
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
