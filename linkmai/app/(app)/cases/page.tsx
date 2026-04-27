'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FileText, Search, Plus, LogOut, ChevronRight, Clock, Folder } from 'lucide-react'
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
    <div className="flex h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside className="w-[240px] flex flex-col shrink-0"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}>
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent-600), var(--accent-700))' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>LinkMai</span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          <div className="nav-item active">
            <Folder className="w-4 h-4 shrink-0" />
            <span>案件管理</span>
          </div>
          <Link href="/search" className="nav-item">
            <Search className="w-4 h-4 shrink-0" />
            <span>法律检索</span>
          </Link>
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
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>案件管理</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>管理你的所有案件和法律文书</p>
            </div>
            <button onClick={() => setShowNew(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              新建案件
            </button>
          </div>

          {/* New case form */}
          {showNew && (
            <div className="rounded-[var(--radius-lg)] p-6 mb-6 animate-fade-up"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-card)' }}>
              <h2 className="font-medium mb-5 text-sm" style={{ color: 'var(--text-primary)' }}>新建案件</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>案件名称</label>
                    <input name="title" required placeholder="如：张三诉李四劳动合同纠纷" className="input-base" />
                  </div>
                  {[
                    { name: 'client_name', label: '当事人', placeholder: '委托方姓名' },
                    { name: 'opponent', label: '对方当事人', placeholder: '对方姓名或名称' },
                    { name: 'court', label: '受理法院', placeholder: '如：北京市朝阳区人民法院' },
                    { name: 'case_number', label: '案号', placeholder: '如：（2024）京0105民初1234号' },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                      <input name={f.name} placeholder={f.placeholder} className="input-base" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>案件类型</label>
                    <select name="case_type" className="input-base">
                      <option value="civil">民事</option>
                      <option value="criminal">刑事</option>
                      <option value="administrative">行政</option>
                      <option value="arbitration">仲裁</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>案情摘要</label>
                  <textarea name="description" rows={3} placeholder="简要描述案件背景和争议焦点..." className="input-base resize-none" />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button type="button" onClick={() => setShowNew(false)} className="btn-outline">取消</button>
                  <button type="submit" disabled={creating} className="btn-primary">
                    {creating ? '创建中...' : '创建案件'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Case list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-5 h-5 rounded-full border-2 spin" style={{ borderColor: 'var(--accent-600)', borderTopColor: 'transparent' }} />
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-24 animate-fade-up">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                <FileText className="w-7 h-7" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>暂无案件</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>点击右上角新建你的第一个案件</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cases.map((c, i) => {
                const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.active
                return (
                  <Link key={c.id} href={`/cases/${c.id}`}
                    className={`card-hover flex items-center justify-between px-5 py-4 animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(108,92,231,0.10)' }}>
                        <FileText className="w-4 h-4" style={{ color: 'var(--accent-400)' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{CASE_TYPE_LABELS[c.case_type]}</span>
                          {c.client_name && <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>当事人：{c.client_name}</span>}
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            <Clock className="w-3 h-3" />
                            {new Date(c.updated_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`status-pill ${st.pill}`}>{st.label}</span>
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
