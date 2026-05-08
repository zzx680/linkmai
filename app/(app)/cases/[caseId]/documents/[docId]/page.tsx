import { createClient } from '@/lib/supabase/server'
import { getDocumentById, getDocumentVersions, getLatestVersion } from '@/lib/data/documents'
import { getCaseById } from '@/lib/data/cases'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Download, Sparkles, User } from 'lucide-react'
import EditPanel from './EditPanel'
import ShareButton from './ShareButton'

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
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, display: 'flex', flexDirection: 'column', flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <img src="/logo.png" alt="Linkmai" style={{ width: 30, height: 30, filter: 'brightness(0) drop-shadow(0 0 0.5px #000) drop-shadow(0 0 0.5px #000)' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>Linkmai</span>
        </div>

        <div style={{ padding: '0 16px 12px' }}>
          <Link href={`/cases/${caseId}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 10px', borderRadius: 8, color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />
            返回案件
          </Link>
        </div>

        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>{caseData.title}</p>
          <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, color: 'var(--text-primary)' }}>{doc.title}</p>
        </div>

        {/* Version history */}
        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px', color: 'var(--text-secondary)' }}>
            <Clock style={{ width: 14, height: 14 }} />
            版本历史
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {versions.map((v) => {
              const isActive = v.version === doc.current_version
              return (
                <div key={v.id}
                  style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, background: isActive ? 'rgba(37,99,235,0.06)' : 'transparent', border: isActive ? '1px solid rgba(37,99,235,0.15)' : '1px solid transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: isActive ? '#2563eb' : 'var(--text-secondary)' }}>v{v.version}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, color: v.source === 'ai' ? '#2563eb' : 'var(--text-tertiary)', background: v.source === 'ai' ? 'rgba(37,99,235,0.08)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      {v.source === 'ai' ? <><Sparkles style={{ width: 10, height: 10 }} />AI</> : <><User style={{ width: 10, height: 10 }} />手动</>}
                    </span>
                  </div>
                  <p style={{ marginTop: 2, fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {new Date(v.created_at).toLocaleDateString('zh-CN')}
                  </p>
                  {v.change_note && (
                    <p style={{ marginTop: 2, fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.change_note}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Document content */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="status-pill active">{DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}</span>
            <span className={`status-pill ${STATUS_PILL[doc.status] || 'muted'}`}>{STATUS_LABEL[doc.status] || doc.status}</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>v{doc.current_version}</span>
          </div>
          {/* Export toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <a
              href={`/api/documents/${docId}/export`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', textDecoration: 'none', cursor: 'pointer' }}
            >
              <Download style={{ width: 13, height: 13 }} />
              导出 Word
            </a>
            <ShareButton
              docId={docId}
              initialShareEnabled={doc.share_enabled}
              initialShareToken={doc.share_token}
            />
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 32, color: 'var(--text-primary)' }}>{doc.title}</h1>

          {latestVersion ? (
            <div style={{ borderRadius: 12, padding: 32, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
              <pre style={{ fontSize: 13, whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.9, color: 'var(--text-secondary)' }}>
                {latestVersion.content}
              </pre>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 0', borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>暂无内容</p>
            </div>
          )}
        </div>
      </main>

      {/* AI Edit Panel */}
      <EditPanel
        docId={docId}
        initialContent={latestVersion?.content || ''}
      />
    </div>
  )
}
