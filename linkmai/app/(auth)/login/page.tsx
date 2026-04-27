'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight, FileText, FolderSearch, Scale } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/cases')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden md:flex w-[42%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'var(--bg-base)' }}>
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 25% 55%, rgba(108,92,231,0.15), transparent), radial-gradient(circle at 10% 90%, rgba(0,184,148,0.06), transparent 50%)'
          }} />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 animate-blur-in">
          <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent-600), var(--accent-700))' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>LinkMai</span>
        </div>

        {/* Slogan */}
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

        {/* Footer */}
        <div className="relative">
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>&copy; 2026 LinkMai</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8"
        style={{ background: 'var(--bg-surface)' }}>
        <div className="w-full max-w-[400px] animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 md:mb-10">
            <div className="w-5 h-5 rounded-md" style={{ background: 'linear-gradient(135deg, var(--accent-600), var(--accent-700))' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>LinkMai</span>
          </div>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>欢迎回来</h2>
          <p className="text-[13px] mt-1.5" style={{ color: 'var(--text-secondary)' }}>登录到你的律师工作台</p>

          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="input-base" style={{ paddingLeft: 36 }}
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                className="input-base" style={{ paddingLeft: 36, paddingRight: 40 }}
                placeholder="输入密码"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-tertiary)' }}>
                <input type="checkbox" className="w-3.5 h-3.5 rounded accent-[var(--accent-600)]" />
                记住登录
              </label>
              <span className="text-xs cursor-pointer" style={{ color: 'var(--accent-400)' }}>忘记密码？</span>
            </div>

            {/* Error */}
            {error && (
              <div className="status-pill danger text-xs">{error}</div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? '登录中...' : <>登录工作台 <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>或使用其他方式</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
          </div>

          {/* Third-party login */}
          <div className="flex gap-3">
            <button className="btn-outline flex-1 text-xs">企业微信</button>
            <button className="btn-outline flex-1 text-xs">钉钉</button>
          </div>

          {/* Register link */}
          <p className="mt-8 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
            还没有账户？{' '}
            <Link href="/register" className="font-medium" style={{ color: 'var(--accent-400)' }}>联系管理员开通</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
