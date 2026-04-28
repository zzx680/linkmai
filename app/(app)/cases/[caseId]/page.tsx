import { createClient } from '@/lib/supabase/server'
import { getCaseById } from '@/lib/data/cases'
import { getDocumentsByCase } from '@/lib/data/documents'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FileText, Zap, ArrowLeft, Plus, Clock, ChevronRight, Scale, Search, Folder } from 'lucide-react'

export const dynamic = 'force-dynamic'

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

export default async function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [caseData, documents] = await Promise.all([
    getCaseById(caseId),
    getDocumentsByCase(caseId),
  ])
  if (!caseData) notFound()

  const caseSt = STATUS_CONFIG[caseData.status] || STATUS_CONFIG.active

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
          <Link href="/cases" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, marginBottom: 2, fontSize: 13, fontWeight: 600, color: '#111', background: '#f0f0f5', textDecoration: 'none' }}>
            <Folder size={15} />案件管理
          </Link>
          <Link href="/search" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, marginBottom: 2, fontSize: 13, color: '#888', textDecoration: 'none' }}>
            <Search size={15} />法律检索
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

        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>

          {/* Case info card */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', padding: '22px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 4 }}>{caseData.title}</h1>
                <span style={{ fontSize: 12, color: '#888', background: '#f5f5f8', padding: '3px 8px', borderRadius: 6 }}>{CASE_TYPE_LABELS[caseData.case_type]}</span>
              </div>
              <span className={`status-pill ${caseSt.pill}`}>{caseSt.label}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px' }}>
              {[
                { label: '当事人', value: caseData.client_name },
                { label: '对方当事人', value: caseData.opponent },
                { label: '受理法院', value: caseData.court },
                { label: '案号', value: caseData.case_number },
              ].filter(f => f.value).map(f => (
                <div key={f.label}>
                  <p style={{ fontSize: 11, color: '#aaa', marginBottom: 3 }}>{f.label}</p>
                  <p style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{f.value}</p>
                </div>
              ))}
            </div>

            {caseData.description && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f5' }}>
                <p style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>案情摘要</p>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>{caseData.description}</p>
              </div>
            )}
          </div>

          {/* Documents */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>文书列表</span>
              <Link href={`/cases/${caseId}/workspace`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>
                <Plus size={13} />AI 起草
              </Link>
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
        </main>
      </div>
    </div>
  )
}
