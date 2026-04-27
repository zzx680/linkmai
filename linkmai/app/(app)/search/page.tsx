'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, FileText, LogOut, Loader2, ExternalLink, Sparkles, Folder } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { SearchResult } from '@/lib/types'

const EXAMPLES = [
  '劳动合同解除经济补偿金计算',
  '合同违约金调整标准',
  '房屋买卖合同纠纷管辖',
  '公司股东知情权',
  '交通事故赔偿标准',
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const supabase = createClient()

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query
    if (!searchQuery.trim() || loading) return
    if (q) setQuery(q)
    setLoading(true)
    setSummary('')
    setResults([])

    try {
      const res = await fetch('/api/agent/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })
      const data = await res.json()
      setSummary(data.summary || '')
      setResults(data.results || [])
      setSearched(true)
    } catch {
      setSummary('检索失败，请重试')
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside className="w-[240px] flex flex-col shrink-0"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}>
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent-600), var(--accent-700))' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>LinkMai</span>
        </div>

        <nav className="flex-1 px-3 pt-3 space-y-0.5">
          <Link href="/cases" className="nav-item">
            <Folder className="w-4 h-4 shrink-0" />
            <span>案件管理</span>
          </Link>
          <div className="nav-item active">
            <Search className="w-4 h-4 shrink-0" />
            <span>法律检索</span>
          </div>
        </nav>

        <div className="p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={handleLogout} className="btn-ghost">
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>法律检索</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI 辅助检索法律法规、司法解释和典型判例</p>
          </div>

          {/* Search bar */}
          <form onSubmit={e => { e.preventDefault(); handleSearch() }} className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-[var(--radius-xl)]"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)' }}>
                <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 text-sm outline-none"
                  style={{ background: 'transparent', color: 'var(--text-primary)' }}
                  placeholder="输入法律问题，如：劳动合同解除的法定条件..."
                />
              </div>
              <button type="submit" disabled={loading || !query.trim()}
                className="px-5 py-3 rounded-[var(--radius-xl)] text-sm font-medium transition-all"
                style={{
                  background: loading || !query.trim()
                    ? 'var(--bg-elevated)'
                    : 'linear-gradient(135deg, var(--accent-600), var(--accent-700))',
                  color: loading || !query.trim() ? 'var(--text-tertiary)' : '#fff',
                  boxShadow: (loading || !query.trim()) ? 'none' : 'var(--shadow-accent)',
                }}>
                {loading ? <Loader2 className="w-4 h-4 spin" /> : '检索'}
              </button>
            </div>
          </form>

          {/* Examples */}
          {!searched && !loading && (
            <div className="mb-8">
              <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>常用检索示例</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex, i) => (
                  <button key={ex} onClick={() => handleSearch(ex)}
                    className={`px-3.5 py-1.5 rounded-full text-xs transition-all animate-fade-up stagger-${i + 1}`}
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--accent-400)'
                      e.currentTarget.style.color = 'var(--accent-400)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-default)'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 animate-fade-up">
              <div className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center"
                style={{ background: 'rgba(108,92,231,0.10)' }}>
                <Sparkles className="w-5 h-5 spin" style={{ color: 'var(--accent-400)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI 正在检索相关法律法规...</p>
            </div>
          )}

          {/* Summary */}
          {summary && !loading && (
            <div className="rounded-[var(--radius-lg)] p-6 mb-4 animate-fade-up"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-400)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--accent-400)' }}>AI 检索摘要</span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {summary}
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && !loading && (
            <div className="animate-fade-up">
              <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>相关来源 ({results.length})</p>
              <div className="space-y-2">
                {results.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                    className={`card-hover flex items-start justify-between gap-3 px-5 py-4 animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--accent-400)' }}>{r.title}</p>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{r.snippet}</p>
                      <p className="text-xs mt-1.5" style={{ color: 'var(--text-tertiary)' }}>{r.source}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--text-tertiary)' }} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
