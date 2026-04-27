'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight, FileText, FolderSearch, Scale } from 'lucide-react'

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
    if (password !== confirm) { setError('两次密码不一致'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/cases')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden md:flex w-[42%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'var(--bg-base)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 25% 55%, rgba(108,92,231,0.15), transparent), radial-gradient(circle at 10% 90%, rgba(0,184,148,0.06), transparent 50%)'
          }} />

        <div className="relative flex items-center gap-2.5 animate-blur-in">
          <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent-600), var(--accent-700))' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>LinkMai</span>
        </div>

        <div className="relative animate-fade-up">
          <h1 className="text-[28px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
            法有据，智无界
          </h1>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            AI 驱动的律师工作平台
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: FileText, text: '文书智能起草' },
              { icon: FolderSearch, text: '案件流程管理' },
              { icon: Scale, text: '法条数据库检索' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 animate-fade-up stagger-${i + 1}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(108,92,231,0.10)' }}>
                  <item.icon className="w-4 h-4" style={{ color: 'var(--accent-400)' }} />
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>&copy; 2026 LinkMai</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8"
        style={{ background: 'var(--bg-surface)' }}>
        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-5 h-5 rounded-md" style={{ background: 'linear-gradient(135deg, var(--accent-600), var(--accent-700))' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>LinkMai</span>
          </div>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>创建账户</h2>
          <p className="text-[13px] mt-1.5" style={{ color: 'var(--text-secondary)' }}>开始使用 AI 法律工作平台</p>

          <form onSubmit={handleRegister} className="mt-7 space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="input-base" style={{ paddingLeft: 36 }}
                placeholder="your@email.com" />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                className="input-base" style={{ paddingLeft: 36, paddingRight: 40 }}
                placeholder="至少 6 位密码"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                className="input-base" style={{ paddingLeft: 36 }}
                placeholder="再次输入密码" />
            </div>

            {error && (
              <div className="status-pill danger text-xs">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? '创建中...' : <>创建账户 <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
            已有账户？{' '}
            <Link href="/login" className="font-medium" style={{ color: 'var(--accent-400)' }}>登录</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
