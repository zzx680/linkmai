import { createClient } from '@/lib/supabase/server'
import { getDocumentById, getDocumentVersions, getLatestVersion } from '@/lib/data/documents'
import { getCaseById } from '@/lib/data/cases'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Sparkles, User } from 'lucide-react'

export const dynamic = 'force-dynamic'

const DOC_TYPE_LABELS: Record<string, string> = {
  complaint: '起诉状', defense: '答辩状', contract: '合同',
  lawyer_letter: '律师函', motion: '申请书', other: '其他文书',
}

const STATUS_PILL: Record<string, string> = {
  draft: 'muted', review: 'warning', final: 'success',
}
const STATUS_LABEL: Record<string, string> = {
  draft: '草稿', review: '审阅中', final: '定稿',
}

export default async function DocumentPage({ params }: { params: Promise<{ caseId: string; docId: string }> }) {
  const { caseId, docId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [doc, caseData, versions, latestVersion] = await Promise.all([
    getDocumentById(docId),
    getCaseById(caseId),
    getDocumentVersions(docId),
    getLatestVersion(docId),
  ])
  if (!doc || !caseData) notFound()

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
          <Link href={`/cases/${caseId}`}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-[var(--radius-md)] transition-colors"
            style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            返回案件
          </Link>
        </div>

        <div className="px-4 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{caseData.title}</p>
          <p className="text-xs font-medium mt-1 leading-snug" style={{ color: 'var(--text-primary)' }}>{doc.title}</p>
        </div>

        {/* Version history */}
        <div className="flex-1 overflow-auto p-3">
          <p className="text-xs font-medium mb-2 flex items-center gap-1.5 px-1" style={{ color: 'var(--text-secondary)' }}>
            <Clock className="w-3.5 h-3.5" />
            版本历史
          </p>
          <div className="space-y-1">
            {versions.map((v) => {
              const isActive = v.version === doc.current_version
              return (
                <div key={v.id}
                  className="px-3 py-2 rounded-[var(--radius-md)] text-xs transition-all"
                  style={{
                    background: isActive ? 'rgba(108,92,231,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(108,92,231,0.15)' : '1px solid transparent',
                  }}>
                  <div className="flex items-center justify-between">
                    <span style={{ color: isActive ? 'var(--accent-400)' : 'var(--text-secondary)' }}>
                      v{v.version}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        color: v.source === 'ai' ? 'var(--accent-400)' : 'var(--text-tertiary)',
                        background: v.source === 'ai' ? 'rgba(108,92,231,0.10)' : 'var(--bg-elevated)',
                      }}>
                      {v.source === 'ai'
                        ? <><Sparkles className="w-2.5 h-2.5" />AI</>
                        : <><User className="w-2.5 h-2.5" />手动</>}
                    </span>
                  </div>
                  <p className="mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(v.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Document content */}
      <main className="flex-1 overflow-auto" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-3xl mx-auto px-12 py-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="status-pill active">{DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}</span>
            <span className={`status-pill ${STATUS_PILL[doc.status] || 'muted'}`}>{STATUS_LABEL[doc.status] || doc.status}</span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>v{doc.current_version}</span>
          </div>
          <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--text-primary)' }}>{doc.title}</h1>

          {latestVersion ? (
            <div className="rounded-[var(--radius-lg)] p-8 animate-fade-up"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {latestVersion.content}
              </pre>
            </div>
          ) : (
            <div className="text-center py-16 rounded-[var(--radius-lg)] animate-fade-up"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>暂无内容</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
