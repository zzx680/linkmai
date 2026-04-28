'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, FileText, LogOut, Loader2, ExternalLink, Sparkles, Folder, Scale } from 'lucide-react'
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
    <div style={{ display: 'flex', height: '100vh', background: '#f5f6fa', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: 220, display: 'flex', flexDirection: 'column', background: '#fff', borderRight: '1px solid #ebebf0', flexShrink: 0 }}>
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f0f0f5' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
              <path d="M12 28 L20 12 L28 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M15 23 L25 23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>Linkmai</span>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: '0.06em', padding: '4px 10px 8px', textTransform: 'uppercase' as const }}>工作台</p>
          <Link href="/cases" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, marginBottom: 2, fontSize: 13, color: '#888', textDecoration: 'none' }}>
            <Folder size={15} />案件管理
          </Link>
          <Link href="/search" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, marginBottom: 2, fontSize: 13, fontWeight: 600, color: '#111', background: '#f0f0f5', textDecoration: 'none' }}>
            <Search size={15} />法律检索
          </Link>
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid #f0f0f5' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: '#999', fontSize: 13 }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <LogOut size={14} />退出登录
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 28px', background: '#fff', borderBottom: '1px solid #ebebf0', flexShrink: 0, gap: 6 }}>
          <Scale size={15} style={{ color: '#aaa' }} />
          <span style={{ fontSize: 13, color: '#aaa' }}>工作台</span>
          <span style={{ fontSize: 13, color: '#ccc', margin: '0 2px' }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>法律检索</span>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>

            {/* Search bar */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', padding: '20px 22px', marginBottom: 20 }}>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>法律检索</h1>
              <p style={{ fontSize: 13, color: '#aaa', marginBottom: 16 }}>AI 辅助检索法律法规、司法解释和典型判例</p>
              <form onSubmit={e => { e.preventDefault(); handleSearch() }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 42, borderRadius: 8, border: '1px solid #e0e0e8', background: '#fafafa' }}>
                    <Search size={15} style={{ color: '#bbb', flexShrink: 0 }} />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#111' }}
                      placeholder="输入法律问题，如：劳动合同解除的法定条件..."
                    />
                  </div>
                  <button type="submit" disabled={loading || !query.trim()}
                    style={{ height: 42, padding: '0 20px', borderRadius: 8, border: 'none', background: loading || !query.trim() ? '#f0f0f5' : '#111', color: loading || !query.trim() ? '#aaa' : '#fff', fontSize: 13, fontWeight: 500, cursor: loading || !query.trim() ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {loading ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Search size={14} />}
                    检索
                  </button>
                </div>
              </form>

              {/* Examples */}
              {!searched && !loading && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: 11, color: '#bbb', marginBottom: 8 }}>常用示例</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                    {EXAMPLES.map(ex => (
                      <button key={ex} onClick={() => handleSearch(ex)}
                        style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid #e8e8f0', background: '#fff', fontSize: 12, color: '#666', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8f0'; e.currentTarget.style.color = '#666' }}>
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Sparkles size={18} style={{ color: '#2563eb', animation: 'spin 1.2s linear infinite' }} />
                </div>
                <p style={{ fontSize: 13, color: '#888' }}>AI 正在检索相关法律法规...</p>
              </div>
            )}

            {/* Summary */}
            {summary && !loading && (
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', padding: '20px 22px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={13} style={{ color: '#2563eb' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>AI 检索摘要</span>
                </div>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{summary}</p>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && !loading && (
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f5' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>相关来源</span>
                  <span style={{ fontSize: 12, color: '#aaa', marginLeft: 8 }}>{results.length} 条</span>
                </div>
                {results.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '14px 20px', borderBottom: i < results.length - 1 ? '1px solid #f5f5f8' : 'none', textDecoration: 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 7, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <FileText size={13} style={{ color: '#2563eb' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#2563eb', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.title}</p>
                        <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{r.snippet}</p>
                        <p style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>{r.source}</p>
                      </div>
                    </div>
                    <ExternalLink size={13} style={{ color: '#ccc', flexShrink: 0, marginTop: 3 }} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
