'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText, Zap, Plus, Clock, ChevronRight, Scale, Search, Folder, LayoutDashboard, Settings, BookOpen, Check, X, Trash2, Calendar, Phone, DollarSign, AlertCircle, Edit2, FileSearch } from 'lucide-react'
import type { Case, Document, CaseDeadline } from '@/lib/types'

const DOC_TYPE_LABELS: Record<string, string> = {
  complaint: '起诉状', defense: '答辩状', contract: '合同',
  lawyer_letter: '律师函', motion: '申请书', other: '其他文书',
}

const CASE_TYPE_LABELS: Record<string, string> = {
  civil: '民事', criminal: '刑事', administrative: '行政', arbitration: '仲裁',
}

const STATUS_CONFIG: Record<string, { label: string; pill: string }> = {
  active:   { label: '进行中', pill: 'active' },
  closed:   { label: '已结案', pill: 'success' },
  archived: { label: '已归档', pill: 'muted' },
}

const DOC_STATUS_CONFIG: Record<string, { label: string; pill: string }> = {
  draft:  { label: '草稿',   pill: 'muted' },
  review: { label: '审阅中', pill: 'warning' },
  final:  { label: '定稿',   pill: 'success' },
}

const FEE_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  unpaid:  { label: '未收费', color: '#ef4444', bg: '#fef2f2' },
  partial: { label: '部分收费', color: '#f59e0b', bg: '#fffbeb' },
  paid:    { label: '已收费', color: '#22c55e', bg: '#f0fdf4' },
}

const DEADLINE_PRESETS = [
  { label: '开庭日期', days: 30 },
  { label: '答辩期限', days: 15 },
  { label: '举证期限', days: 30 },
  { label: '上诉期限', days: 15 },
]

type TabKey = 'info' | 'deadlines' | 'documents'

export default function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [deadlines, setDeadlines] = useState<CaseDeadline[]>([])
  const [loading, setLoading] = useState(true)
  const [caseId, setCaseId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabKey>('info')
  const router = useRouter()

  // Deadline form state
  const [showDeadlineForm, setShowDeadlineForm] = useState(false)
  const [dlTitle, setDlTitle] = useState('')
  const [dlDate, setDlDate] = useState('')

  // Edit state for case info
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => { params.then(p => setCaseId(p.caseId)) }, [params])

  const loadData = useCallback(() => {
    if (!caseId) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      Promise.all([
        fetch(`/api/cases/${caseId}`).then(r => r.json()),
        fetch(`/api/documents?caseId=${caseId}`).then(r => r.json()),
        fetch(`/api/cases/${caseId}/deadlines`).then(r => r.json()),
      ]).then(([caseRes, docsRes, dlRes]) => {
        if (caseRes.error || !caseRes) { router.push('/cases'); return }
        setCaseData(caseRes)
        setDocuments(Array.isArray(docsRes) ? docsRes : [])
        setDeadlines(Array.isArray(dlRes) ? dlRes : [])
        setLoading(false)
      })
    })
  }, [caseId, router])

  useEffect(() => { loadData() }, [loadData])

  if (loading || !caseData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f6fa' }}>
        <div style={{ width: 24, height: 24, border: '2px solid #e0e0e5', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  const caseSt = STATUS_CONFIG[caseData.status] || STATUS_CONFIG.active

  // === Case info edit handlers ===
  const startEdit = (field: string, value: string | null | undefined) => {
    setEditingField(field)
    setEditValue(value || '')
  }

  const saveEdit = async (field: string) => {
    const body: Record<string, unknown> = { [field]: editValue || null }
    if (field === 'fee_amount') body[field] = editValue ? parseInt(editValue) : null
    await fetch(`/api/cases/${caseId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setCaseData(prev => prev ? { ...prev, [field]: field === 'fee_amount' ? (editValue ? parseInt(editValue) : null) : (editValue || null) } : prev)
    setEditingField(null)
  }

  const saveFeeStatus = async (status: string) => {
    await fetch(`/api/cases/${caseId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fee_status: status }) })
    setCaseData(prev => prev ? { ...prev, fee_status: status as Case['fee_status'] } : prev)
  }

  // === Deadline handlers ===
  const addDeadline = async () => {
    if (!dlTitle.trim() || !dlDate) return
    const res = await fetch(`/api/cases/${caseId}/deadlines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: dlTitle.trim(), due_date: dlDate }),
    })
    if (res.ok) {
      const newDl = await res.json()
      setDeadlines(prev => [...prev, newDl].sort((a, b) => a.due_date.localeCompare(b.due_date)))
      setDlTitle('')
      setDlDate('')
      setShowDeadlineForm(false)
    }
  }

  const toggleDeadline = async (dl: CaseDeadline) => {
    const newStatus = dl.status === 'done' ? 'pending' : 'done'
    const res = await fetch(`/api/cases/${caseId}/deadlines/${dl.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setDeadlines(prev => prev.map(d => d.id === dl.id ? { ...d, status: newStatus } : d))
    }
  }

  const removeDeadline = async (id: string) => {
    const res = await fetch(`/api/cases/${caseId}/deadlines/${id}`, { method: 'DELETE' })
    if (res.ok) setDeadlines(prev => prev.filter(d => d.id !== id))
  }

  const applyPreset = (preset: typeof DEADLINE_PRESETS[0]) => {
    setDlTitle(preset.label)
    const d = new Date()
    d.setDate(d.getDate() + preset.days)
    setDlDate(d.toISOString().split('T')[0])
  }

  const getDeadlineUrgency = (dl: CaseDeadline): { color: string; bg: string; label: string } => {
    if (dl.status === 'done') return { color: '#22c55e', bg: '#f0fdf4', label: '已完成' }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dl.due_date + 'T00:00:00')
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    if (diff < 0) return { color: '#ef4444', bg: '#fef2f2', label: '已逾期' }
    if (diff <= 7) return { color: '#f59e0b', bg: '#fffbeb', label: '即将到期' }
    return { color: '#3b82f6', bg: '#eff6ff', label: '进行中' }
  }

  // === Editable field component ===
  const EditableField = ({ label, field, value, icon, type = 'text', prefix }: {
    label: string; field: string; value: string | null | undefined
    icon?: React.ReactNode; type?: string; prefix?: string
  }) => (
    <div style={{ marginBottom: 0 }}>
      <p style={{ fontSize: 11, color: '#aaa', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>{icon}{label}</p>
      {editingField === field ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {prefix && <span style={{ fontSize: 13, color: '#888' }}>{prefix}</span>}
          <input
            type={type}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(field); if (e.key === 'Escape') setEditingField(null) }}
            autoFocus
            style={{ flex: 1, height: 30, padding: '0 8px', borderRadius: 6, border: '1px solid #2563eb', fontSize: 13, color: '#333', outline: 'none', background: '#fff' }}
          />
          <button onClick={() => saveEdit(field)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', padding: 4 }}><Check size={14} /></button>
          <button onClick={() => setEditingField(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}><X size={14} /></button>
        </div>
      ) : (
        <div
          style={{ fontSize: 13, color: value ? '#333' : '#ccc', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, minHeight: 30, padding: '3px 0', borderRadius: 4 }}
          onClick={() => startEdit(field, type === 'number' ? String(value ?? '') : value)}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f8'; e.currentTarget.style.padding = '3px 6px' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.padding = '3px 0' }}
        >
          {prefix && <span style={{ color: '#888' }}>{prefix}</span>}
          {value ? (type === 'number' ? `¥${Number(value).toLocaleString()}` : value) : '点击填写'}
          <Edit2 size={11} style={{ color: '#ccc', opacity: 0, transition: 'opacity 0.15s' }} />
        </div>
      )}
    </div>
  )

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'info', label: '基本信息', icon: <Scale size={14} /> },
    { key: 'deadlines', label: '重要期限', icon: <Calendar size={14} /> },
    { key: 'documents', label: '文书列表', icon: <FileText size={14} /> },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f6fa', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: 220, display: 'flex', flexDirection: 'column', background: '#fff', borderRight: '1px solid #ebebf0', flexShrink: 0 }}>
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid #f0f0f5' }}>
          <img src="/logo.png" alt="Linkmai" style={{ width: 30, height: 30, filter: 'brightness(0) drop-shadow(0 0 0.5px #000) drop-shadow(0 0 0.5px #000)' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>Linkmai</span>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: '0.06em', padding: '4px 10px 8px', textTransform: 'uppercase' as const }}>工作台</p>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, marginBottom: 2, fontSize: 13, color: '#888', textDecoration: 'none' }}>
            <LayoutDashboard size={15} />使用日志
          </Link>
          <Link href="/cases" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, marginBottom: 2, fontSize: 13, fontWeight: 600, color: '#111', background: '#f0f0f5', textDecoration: 'none' }}>
            <Folder size={15} />案件管理
          </Link>
          <Link href="/search" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, marginBottom: 2, fontSize: 13, color: '#888', textDecoration: 'none' }}>
            <Search size={15} />法律检索
          </Link>
          <Link href="/templates" style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 8, marginBottom: 2, fontSize: 13, color: "#888", textDecoration: "none" }}>
            <BookOpen size={15} />模板库
          </Link>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f5' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: '0.06em', padding: '0 10px 8px', textTransform: 'uppercase' as const }}>当前案件</p>
            <div style={{ padding: '8px 10px', borderRadius: 8, background: '#f8f8fb' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: 4 }}>{caseData.title}</p>
              <p style={{ fontSize: 11, color: '#aaa' }}>{CASE_TYPE_LABELS[caseData.case_type]}</p>
            </div>
            <div style={{ marginTop: 8 }}>
              <Link href={`/cases/${caseId}`} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, marginBottom: 2, fontSize: 13, fontWeight: 600, color: '#111', background: '#f0f0f5', textDecoration: 'none' }}>
                <FileText size={15} />文书列表
              </Link>
              <Link href={`/cases/${caseId}/workspace`} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, fontSize: 13, color: '#888', textDecoration: 'none' }}>
                <Zap size={15} />AI 工作台
              </Link>
            </div>
          </div>
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid #f0f0f5' }}>
          <Link href="/pricing" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, fontSize: 13, color: '#2563eb', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={14} />升级套餐</span>
            <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: '#f0f4ff', color: '#2563eb' }}>免费版</span>
          </Link>
          <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, fontSize: 13, color: '#888', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Settings size={15} />设置
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', background: '#fff', borderBottom: '1px solid #ebebf0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Scale size={15} style={{ color: '#aaa' }} />
            <Link href="/cases" style={{ fontSize: 13, color: '#aaa', textDecoration: 'none' }}>案件管理</Link>
            <span style={{ fontSize: 13, color: '#ccc', margin: '0 2px' }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{caseData.title}</span>
          </div>
          <Link href={`/cases/${caseId}/workspace`} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 16px', borderRadius: 8, background: '#111', color: '#fff', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            <Zap size={14} />
            打开 AI 工作台
          </Link>
        </header>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, background: '#fff', borderBottom: '1px solid #ebebf0', padding: '0 28px', flexShrink: 0 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '12px 18px', fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? '#111' : '#888',
                background: 'none', border: 'none', borderBottom: activeTab === tab.key ? '2px solid #111' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {tab.icon}{tab.label}
              {tab.key === 'deadlines' && deadlines.filter(d => d.status === 'pending').length > 0 && (
                <span style={{ fontSize: 10, fontWeight: 600, background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 6px', marginLeft: 2 }}>
                  {deadlines.filter(d => d.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>

          {/* ===== Tab: 基本信息 ===== */}
          {activeTab === 'info' && (
            <>
              {/* Case header card */}
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', padding: '22px 24px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div>
                    <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 4 }}>{caseData.title}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#888', background: '#f5f5f8', padding: '3px 8px', borderRadius: 6 }}>{CASE_TYPE_LABELS[caseData.case_type]}</span>
                      <span className={`status-pill ${caseSt.pill}`}>{caseSt.label}</span>
                    </div>
                  </div>
                </div>

                {/* Editable fields grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
                  <EditableField label="当事人" field="client_name" value={caseData.client_name} icon={<Scale size={11} />} />
                  <EditableField label="对方当事人" field="opponent" value={caseData.opponent} />
                  <EditableField label="受理法院" field="court" value={caseData.court} />
                  <EditableField label="案号" field="case_number" value={caseData.case_number} />
                  <EditableField label="联系电话" field="client_phone" value={caseData.client_phone} icon={<Phone size={11} />} />
                  <EditableField label="案件描述" field="description" value={caseData.description} />
                </div>
              </div>

              {/* Fee tracking card */}
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', padding: '22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <DollarSign size={15} style={{ color: '#888' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>费用信息</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                  <EditableField label="代理费金额" field="fee_amount" value={caseData.fee_amount != null ? String(caseData.fee_amount) : null} type="number" prefix="¥" />
                  <div>
                    <p style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>收费状态</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['unpaid', 'partial', 'paid'] as const).map(s => {
                        const cfg = FEE_STATUS_LABELS[s]
                        const isActive = (caseData.fee_status || 'unpaid') === s
                        return (
                          <button key={s} onClick={() => saveFeeStatus(s)} style={{
                            padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                            border: `1px solid ${isActive ? cfg.color : '#ebebf0'}`,
                            background: isActive ? cfg.bg : '#fff',
                            color: isActive ? cfg.color : '#888',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}>
                            {cfg.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===== Tab: 重要期限 ===== */}
          {activeTab === 'deadlines' && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>重要期限</span>
                <button
                  onClick={() => setShowDeadlineForm(!showDeadlineForm)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                >
                  <Plus size={13} />添加期限
                </button>
              </div>

              {/* Add deadline form */}
              {showDeadlineForm && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f5', background: '#fafafa' }}>
                  {/* Presets */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {DEADLINE_PRESETS.map(p => (
                      <button key={p.label} onClick={() => applyPreset(p)} style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                        border: '1px solid #ebebf0', background: '#fff', color: '#555', cursor: 'pointer',
                      }}>
                        {p.label} ({p.days}天)
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ flex: 2 }}>
                      <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>标题</label>
                      <input value={dlTitle} onChange={e => setDlTitle(e.target.value)} placeholder="如：开庭日期"
                        style={{ width: '100%', height: 32, padding: '0 10px', borderRadius: 6, border: '1px solid #ebebf0', fontSize: 13, color: '#333', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>到期日期</label>
                      <input type="date" value={dlDate} onChange={e => setDlDate(e.target.value)}
                        style={{ width: '100%', height: 32, padding: '0 10px', borderRadius: 6, border: '1px solid #ebebf0', fontSize: 13, color: '#333', outline: 'none' }} />
                    </div>
                    <button onClick={addDeadline} disabled={!dlTitle.trim() || !dlDate} style={{
                      height: 32, padding: '0 16px', borderRadius: 6, border: 'none',
                      background: (!dlTitle.trim() || !dlDate) ? '#ccc' : '#2563eb', color: '#fff',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    }}>
                      添加
                    </button>
                    <button onClick={() => { setShowDeadlineForm(false); setDlTitle(''); setDlDate('') }} style={{
                      height: 32, padding: '0 12px', borderRadius: 6, border: '1px solid #ebebf0',
                      background: '#fff', color: '#888', fontSize: 12, cursor: 'pointer',
                    }}>
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {deadlines.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f5f5f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Calendar size={18} style={{ color: '#ccc' }} />
                  </div>
                  <p style={{ fontSize: 13, color: '#aaa' }}>暂无期限记录</p>
                  <button onClick={() => setShowDeadlineForm(true)} style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', marginTop: 6 }}>
                    添加第一个期限
                  </button>
                </div>
              ) : (
                <div style={{ padding: '16px 20px' }}>
                  {deadlines.map((dl, i) => {
                    const urgency = getDeadlineUrgency(dl)
                    return (
                      <div key={dl.id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative',
                        paddingBottom: i < deadlines.length - 1 ? 20 : 0,
                      }}>
                        {/* Timeline line */}
                        {i < deadlines.length - 1 && (
                          <div style={{ position: 'absolute', left: 11, top: 24, bottom: 0, width: 2, background: '#f0f0f5' }} />
                        )}
                        {/* Dot */}
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${urgency.color}`, background: dl.status === 'done' ? urgency.color : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          zIndex: 1, cursor: 'pointer', transition: 'all 0.15s',
                        }} onClick={() => toggleDeadline(dl)}>
                          {dl.status === 'done' && <Check size={12} style={{ color: '#fff' }} />}
                        </div>
                        {/* Content */}
                        <div style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', borderRadius: 10, background: urgency.bg,
                          border: `1px solid ${urgency.color}22`,
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 500, color: dl.status === 'done' ? '#888' : '#333', textDecoration: dl.status === 'done' ? 'line-through' : 'none' }}>
                                {dl.title}
                              </span>
                              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: urgency.color + '18', color: urgency.color, fontWeight: 500 }}>
                                {urgency.label}
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
                              <Clock size={11} style={{ marginRight: 3, verticalAlign: -1 }} />
                              {new Date(dl.due_date + 'T00:00:00').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <button onClick={() => removeDeadline(dl.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4,
                          }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color = '#ccc'}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== Tab: 文书列表 ===== */}
          {activeTab === 'documents' && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>文书列表</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/cases/${caseId}/contract-review`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#555', textDecoration: 'none', padding: '4px 10px', borderRadius: 6, border: '1px solid #e0e0e8', background: '#fff' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <FileSearch size={12} />合同审查
                  </Link>
                  <Link href={`/cases/${caseId}/workspace`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>
                    <Plus size={13} />AI 起草
                  </Link>
                </div>
              </div>

              {documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f5f5f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <FileText size={18} style={{ color: '#ccc' }} />
                  </div>
                  <p style={{ fontSize: 13, color: '#aaa' }}>暂无文书</p>
                  <Link href={`/cases/${caseId}/workspace`} style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', marginTop: 6, display: 'inline-block' }}>前往 AI 工作台起草</Link>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fafafa' }}>
                      {['文书名称', '类型', '版本', '更新时间', '状态', ''].map(h => (
                        <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#aaa', borderBottom: '1px solid #f0f0f5' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => {
                      const docSt = DOC_STATUS_CONFIG[doc.status] || DOC_STATUS_CONFIG.draft
                      return (
                        <tr key={doc.id}
                          style={{ borderBottom: '1px solid #f5f5f8', cursor: 'pointer', transition: 'background 0.1s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          onClick={() => window.location.href = `/cases/${caseId}/documents/${doc.id}`}>
                          <td style={{ padding: '13px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 30, height: 30, borderRadius: 7, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FileText size={13} style={{ color: '#2563eb' }} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{doc.title}</span>
                            </div>
                          </td>
                          <td style={{ padding: '13px 20px' }}>
                            <span style={{ fontSize: 12, color: '#888', background: '#f5f5f8', padding: '3px 8px', borderRadius: 6 }}>{DOC_TYPE_LABELS[doc.doc_type]}</span>
                          </td>
                          <td style={{ padding: '13px 20px', fontSize: 12, color: '#aaa' }}>v{doc.current_version}</td>
                          <td style={{ padding: '13px 20px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#aaa' }}>
                              <Clock size={12} />
                              {new Date(doc.updated_at).toLocaleDateString('zh-CN')}
                            </span>
                          </td>
                          <td style={{ padding: '13px 20px' }}>
                            <span className={`status-pill ${docSt.pill}`}>{docSt.label}</span>
                          </td>
                          <td style={{ padding: '13px 20px' }}>
                            <ChevronRight size={15} style={{ color: '#ccc' }} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
