'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FileText, Search, Plus, LogOut, ChevronRight, Clock, Folder, X, Scale } from 'lucide-react'
import type { Case } from '@/lib/types'

const CASE_TYPE_LABELS: Record<string, string> = {
  civil: '民事', criminal: '刑事', administrative: '行政', arbitration: '仲裁',
}

const STATUS_CONFIG: Record<string, { label: string; pill: string }> = {
  active:   { label: '进行中', pill: 'active' },
  closed:   { label: '已结案', pill: 'success' },
  archived: { label: '已归档', pill: 'muted' },
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [creating, setCreating] = useState(false)
  const supabase = createClient()

  useEffect(() => { fetchCases() }, [])

  const fetchCases = async () => {
    const res = await fetch('/api/cases')
    if (res.ok) setCases(await res.json())
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: fd.get('title'),
        case_type: fd.get('case_type'),
        client_name: fd.get('client_name') || null,
        opponent: fd.get('opponent') || null,
        court: fd.get('court') || null,
        case_number: fd.get('case_number') || null,
        description: fd.get('description') || null,
      }),
    })
    if (res.ok) { setShowNew(false); fetchCases() }
    setCreating(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f6fa', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: 220, display: 'flex', flexDirection: 'column', background: '#fff', borderRight: '1px solid #ebebf0', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f0f0f5' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
              <path d="M12 28 L20 12 L28 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M15 23 L25 23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>Linkmai</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: '0.06em', padding: '4px 10px 8px', textTransform: 'uppercase' }}>工作台</p>
          <SidebarItem icon={<Folder size={15} />} label="案件管理" active href="/cases" />
          <SidebarItem icon={<Search size={15} />} label="法律检索" href="/search" />
        </nav>

        {/* User */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #f0f0f5' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: '#999', fontSize: 13 }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <LogOut size={14} />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top header */}
        <header style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', background: '#fff', borderBottom: '1px solid #ebebf0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Scale size={15} style={{ color: '#aaa' }} />
            <span style={{ fontSize: 13, color: '#aaa' }}>工作台</span>
            <span style={{ fontSize: 13, color: '#ccc', margin: '0 2px' }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>案件管理</span>
          </div>
          <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 16px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#333'}
            onMouseLeave={e => e.currentTarget.style.background = '#111'}>
            <Plus size={14} />
            新建案件
          </button>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>

          {/* New case modal */}
          {showNew && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 520, background: '#fff', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>新建案件</h2>
                  <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}>
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleCreate}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <FormLabel>案件名称 *</FormLabel>
                      <input name="title" required placeholder="如：张三诉李四劳动合同纠纷" className="input-base" />
                    </div>
                    <div>
                      <FormLabel>案件类型</FormLabel>
                      <select name="case_type" className="input-base">
                        <option value="civil">民事</option>
                        <option value="criminal">刑事</option>
                        <option value="administrative">行政</option>
                        <option value="arbitration">仲裁</option>
                      </select>
                    </div>
                    <div>
                      <FormLabel>当事人</FormLabel>
                      <input name="client_name" placeholder="委托方姓名" className="input-base" />
                    </div>
                    <div>
                      <FormLabel>对方当事人</FormLabel>
                      <input name="opponent" placeholder="对方姓名或名称" className="input-base" />
                    </div>
                    <div>
                      <FormLabel>受理法院</FormLabel>
                      <input name="court" placeholder="如：北京市朝阳区人民法院" className="input-base" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <FormLabel>案号</FormLabel>
                      <input name="case_number" placeholder="如：（2024）京0105民初1234号" className="input-base" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <FormLabel>案情摘要</FormLabel>
                      <textarea name="description" rows={3} placeholder="简要描述案件背景和争议焦点..." className="input-base" style={{ resize: 'none' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                    <button type="button" onClick={() => setShowNew(false)} style={{ height: 36, padding: '0 18px', borderRadius: 8, border: '1px solid #e0e0e5', background: '#fff', color: '#555', fontSize: 13, cursor: 'pointer' }}>取消</button>
                    <button type="submit" disabled={creating} style={{ height: 36, padding: '0 18px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: creating ? 0.6 : 1 }}>
                      {creating ? '创建中...' : '创建案件'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: '全部案件', value: cases.length, color: '#111' },
              { label: '进行中', value: cases.filter(c => c.status === 'active').length, color: '#2563eb' },
              { label: '已结案', value: cases.filter(c => c.status === 'closed').length, color: '#16a34a' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '18px 22px', border: '1px solid #ebebf0' }}>
                <p style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>{s.label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Case list */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>案件列表</span>
              <span style={{ fontSize: 12, color: '#aaa' }}>{cases.length} 个案件</span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #e0e0e5', borderTopColor: '#111', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : cases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f5f5f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <FileText size={20} style={{ color: '#ccc' }} />
                </div>
                <p style={{ fontSize: 14, color: '#aaa' }}>暂无案件</p>
                <p style={{ fontSize: 12, color: '#ccc', marginTop: 4 }}>点击右上角新建你的第一个案件</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    {['案件名称', '类型', '当事人', '更新时间', '状态', ''].map(h => (
                      <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#aaa', borderBottom: '1px solid #f0f0f5' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => {
                    const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.active
                    return (
                      <tr key={c.id}
                        style={{ borderBottom: '1px solid #f5f5f8', cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => window.location.href = `/cases/${c.id}`}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <FileText size={14} style={{ color: '#2563eb' }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{c.title}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: 12, color: '#888', background: '#f5f5f8', padding: '3px 8px', borderRadius: 6 }}>{CASE_TYPE_LABELS[c.case_type]}</span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#666' }}>{c.client_name || '—'}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#aaa' }}>
                            <Clock size={12} />
                            {new Date(c.updated_at).toLocaleDateString('zh-CN')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span className={`status-pill ${st.pill}`}>{st.label}</span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <ChevronRight size={15} style={{ color: '#ccc' }} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, active, href }: { icon: React.ReactNode; label: string; active?: boolean; href: string }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '8px 10px', borderRadius: 8, marginBottom: 2,
      fontSize: 13, fontWeight: active ? 600 : 400,
      color: active ? '#111' : '#888',
      background: active ? '#f0f0f5' : 'transparent',
      textDecoration: 'none', transition: 'background 0.1s, color 0.1s',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f5f8' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
      {icon}
      {label}
    </Link>
  )
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>{children}</label>
}
