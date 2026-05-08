'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Folder, Search, Scale, Plus,
  Clock, ChevronRight, PenLine,
  ScrollText, Activity
} from 'lucide-react'
import type { Case, Document } from '@/lib/types'
import Sidebar from '@/app/components/Sidebar'

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

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6)  return '夜深了，注意休息'
  if (h < 12) return '早上好'
  if (h < 14) return '午安'
  if (h < 18) return '下午好'
  if (h < 22) return '晚上好'
  return '夜深了，注意休息'
}

type LogEntry =
  | { type: 'case';     ts: string; caseId: string; title: string; caseType: string; status: string }
  | { type: 'document'; ts: string; caseId: string; docId: string; title: string; docType: string }

export default function DashboardPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
        setUserName(name)
      }

      const [casesRes, docsRes] = await Promise.all([
        fetch('/api/cases'),
        fetch('/api/documents?limit=20'),
      ])
      if (casesRes.ok) setCases(await casesRes.json())
      if (docsRes.ok) {
        const docs = await docsRes.json()
        setDocuments(Array.isArray(docs) ? docs : [])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  // Build unified log sorted by time desc
  const logs: LogEntry[] = [
    ...cases.map(c => ({
      type: 'case' as const,
      ts: c.updated_at || c.created_at,
      caseId: c.id,
      title: c.title,
      caseType: c.case_type,
      status: c.status,
    })),
    ...documents.map(d => ({
      type: 'document' as const,
      ts: d.updated_at,
      caseId: d.case_id,
      docId: d.id,
      title: d.title,
      docType: d.doc_type,
    })),
  ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()).slice(0, 30)

  const activeCases = cases.filter(c => c.status === 'active').length

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / 1000
    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} 天前`
    return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f6fa', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif" }}>

      <Sidebar />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', background: '#fff', borderBottom: '1px solid #ebebf0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Scale size={15} style={{ color: '#aaa' }} />
            <span style={{ fontSize: 13, color: '#aaa' }}>工作台</span>
            <span style={{ fontSize: 13, color: '#ccc', margin: '0 2px' }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>使用日志</span>
          </div>
          <Link href="/cases" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 16px', borderRadius: 8, background: '#111', color: '#fff', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#333'}
            onMouseLeave={e => e.currentTarget.style.background = '#111'}>
            案件管理
          </Link>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>

          {/* Welcome banner */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ebebf0', padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 11, color: '#aaa', marginBottom: 6, letterSpacing: '0.04em' }}>
                {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 8, letterSpacing: '-0.02em' }}>
                {getGreeting()}{userName ? `，${userName}` : ''}
              </h1>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>
                {activeCases > 0
                  ? `你有 ${activeCases} 个进行中的案件，共 ${cases.length} 个案件、${documents.length} 份文书。`
                  : cases.length > 0
                    ? `共 ${cases.length} 个案件、${documents.length} 份文书。`
                    : '还没有案件，新建一个开始工作吧。'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <Link href="/cases" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #e0e0e8', background: '#fff', color: '#555', fontSize: 13, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <Folder size={14} />案件管理
              </Link>
              <Link href="/search" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #e0e0e8', background: '#fff', color: '#555', fontSize: 13, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <Search size={14} />法律检索
              </Link>
            </div>
          </div>

          {/* Activity log */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f5', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={14} style={{ color: '#aaa' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>最近操作</span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #e0e0e5', borderTopColor: '#111', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 20px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f5f5f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <ScrollText size={18} style={{ color: '#ccc' }} />
                </div>
                <p style={{ fontSize: 13, color: '#aaa', marginBottom: 6 }}>暂无操作记录</p>
                <Link href="/cases" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>新建第一个案件</Link>
              </div>
            ) : (
              <div>
                {logs.map((entry, i) => {
                  const isCase = entry.type === 'case'
                  const href = isCase
                    ? `/cases/${entry.caseId}`
                    : `/cases/${entry.caseId}/documents/${entry.docId}`

                  const icon = isCase
                    ? <Folder size={14} style={{ color: '#2563eb' }} />
                    : <PenLine size={14} style={{ color: '#16a34a' }} />

                  const iconBg = isCase ? '#f0f4ff' : '#f0fff4'

                  const badge = isCase
                    ? CASE_TYPE_LABELS[entry.caseType] || entry.caseType
                    : DOC_TYPE_LABELS[entry.docType] || entry.docType

                  const sub = isCase
                    ? STATUS_CONFIG[entry.status]?.label || entry.status
                    : '文书'

                  return (
                    <Link key={`${entry.type}-${isCase ? entry.caseId : entry.docId}-${i}`}
                      href={href}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', textDecoration: 'none', borderBottom: i < logs.length - 1 ? '1px solid #f5f5f8' : 'none', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {icon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                          {entry.title}
                        </p>
                        <p style={{ fontSize: 11, color: '#aaa', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ background: '#f5f5f8', padding: '1px 6px', borderRadius: 4, color: '#888' }}>{badge}</span>
                          <span>{sub}</span>
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: '#bbb', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} />{formatTime(entry.ts)}
                        </span>
                        <ChevronRight size={14} style={{ color: '#ddd' }} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  )
}
