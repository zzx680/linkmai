import { createClient } from '@/lib/supabase/server'
import { getCaseById } from '@/lib/data/cases'
import { getDocumentsByCase } from '@/lib/data/documents'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FileText, Zap, ArrowLeft, Plus, Clock, ChevronRight } from 'lucide-react'

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
    <div className="flex h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside className="w-[240px] flex flex-col shrink-0"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}>
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent-600), var(--accent-700))' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>LinkMai</span>
        </div>

        <div className="px-4 pb-3">
          <Link href="/cases" className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            所有案件
          </Link>
        </div>

        <div className="px-4 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <p className="text-xs font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{caseData.title}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{CASE_TYPE_LABELS[caseData.case_type]}</p>
        </div>

        <nav className="flex-1 px-3 pt-3 space-y-0.5">
          <div className="nav-item active">
            <FileText className="w-4 h-4 shrink-0" />
            <span>文书列表</span>
          </div>
          <Link href={`/cases/${caseId}/workspace`} className="nav-item">
            <Zap className="w-4 h-4 shrink-0" />
            <span>AI 工作台</span>
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {/* Case info card */}
          <div className="rounded-[var(--radius-lg)] p-6 mb-6 animate-fade-up"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{caseData.title}</h1>
              <span className={`status-pill ${caseSt.pill} ml-4`}>{caseSt.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: '案件类型', value: CASE_TYPE_LABELS[caseData.case_type] },
                { label: '当事人', value: caseData.client_name },
                { label: '对方当事人', value: caseData.opponent },
                { label: '受理法院', value: caseData.court },
                { label: '案号', value: caseData.case_number },
              ].filter(f => f.value).map(f => (
                <div key={f.label}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{f.label}：</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{f.value}</span>
                </div>
              ))}
            </div>
            {caseData.description && (
              <p className="mt-4 text-sm pt-4" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
                {caseData.description}
              </p>
            )}
            <div className="mt-5">
              <Link href={`/cases/${caseId}/workspace`} className="btn-primary inline-flex items-center gap-2">
                <Zap className="w-4 h-4" />
                打开 AI 工作台
              </Link>
            </div>
          </div>

          {/* Documents */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>文书 ({documents.length})</h2>
            <Link href={`/cases/${caseId}/workspace`}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: 'var(--accent-400)' }}>
              <Plus className="w-3.5 h-3.5" />
              AI 起草
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-16 rounded-[var(--radius-lg)] animate-fade-up"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
              <div className="w-12 h-12 rounded-[var(--radius-md)] mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'var(--bg-elevated)' }}>
                <FileText className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>暂无文书</p>
              <Link href={`/cases/${caseId}/workspace`} className="text-xs mt-2 inline-block" style={{ color: 'var(--accent-400)' }}>
                前往 AI 工作台起草
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc, i) => {
                const docSt = DOC_STATUS_CONFIG[doc.status] || DOC_STATUS_CONFIG.draft
                return (
                  <Link key={doc.id} href={`/cases/${caseId}/documents/${doc.id}`}
                    className={`card-hover flex items-center justify-between px-5 py-3.5 animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(108,92,231,0.10)' }}>
                        <FileText className="w-3.5 h-3.5" style={{ color: 'var(--accent-400)' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{doc.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{DOC_TYPE_LABELS[doc.doc_type]}</span>
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>v{doc.current_version}</span>
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            <Clock className="w-3 h-3" />
                            {new Date(doc.updated_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`status-pill ${docSt.pill}`}>{docSt.label}</span>
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
