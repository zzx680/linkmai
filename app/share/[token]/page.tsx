import { notFound } from 'next/navigation'
import { getDocumentByShareToken } from '@/lib/data/documents'

const DOC_TYPE_LABELS: Record<string, string> = {
  complaint: '起诉状', defense: '答辩状', contract: '合同',
  lawyer_letter: '律师函', motion: '申请书', other: '其他文书',
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const result = await getDocumentByShareToken(token)
  if (!result) notFound()

  const { document: doc, content } = result

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif", padding: '40px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 32 }}>
          <img src="/logo.png" alt="Linkmai" style={{ width: 30, height: 30, filter: 'brightness(0) drop-shadow(0 0 0.5px #000) drop-shadow(0 0 0.5px #000)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Linkmai</span>
          <span style={{ fontSize: 12, color: '#ccc', marginLeft: 4 }}>· 只读分享</span>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', padding: '40px 48px' }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#f0f0f5', color: '#888' }}>
              {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 32 }}>{doc.title}</h1>
          <pre style={{ fontSize: 13, whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.9, color: '#333', margin: 0 }}>
            {content}
          </pre>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 24 }}>
          由 Linkmai 法律 AI 生成 · 仅供参考，不构成正式法律意见
        </p>
      </div>
    </div>
  )
}
