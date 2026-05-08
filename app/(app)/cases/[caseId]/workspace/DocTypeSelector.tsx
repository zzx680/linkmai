'use client'

import { FileText, Shield, Mail, FileCheck, ScrollText, FilePlus } from 'lucide-react'
import type { DocType } from '@/lib/types'

const DOC_ICONS: Record<DocType, React.ReactNode> = {
  complaint: <FileText size={20} style={{ color: 'var(--accent-500)' }} />,
  defense: <Shield size={20} style={{ color: '#16a34a' }} />,
  lawyer_letter: <Mail size={20} style={{ color: '#d97706' }} />,
  contract: <FileCheck size={20} style={{ color: '#7c3aed' }} />,
  motion: <ScrollText size={20} style={{ color: '#0891b2' }} />,
  other: <FilePlus size={20} style={{ color: 'var(--text-tertiary)' }} />,
}

const DOC_COLORS: Record<DocType, string> = {
  complaint: 'var(--accent-dim)',
  defense: 'rgba(22,163,74,0.08)',
  lawyer_letter: 'rgba(217,119,6,0.08)',
  contract: 'rgba(124,58,237,0.08)',
  motion: 'rgba(8,145,178,0.08)',
  other: 'var(--bg-elevated)',
}

const DOC_TYPES = [
  { docType: 'complaint' as DocType, label: '起诉状', desc: '向法院提起民事诉讼' },
  { docType: 'defense' as DocType, label: '答辩状', desc: '针对原告诉请进行答辩' },
  { docType: 'lawyer_letter' as DocType, label: '律师函', desc: '正式法律通知函件' },
  { docType: 'contract' as DocType, label: '合同', desc: '起草各类商业合同' },
  { docType: 'motion' as DocType, label: '申请书', desc: '向法院或机关提出申请' },
  { docType: 'other' as DocType, label: '其他文书', desc: '自定义法律文书' },
]

interface Props {
  onSelect: (docType: DocType) => void
}

export default function DocTypeSelector({ onSelect }: Props) {
  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10 }}>
        选择要起草的文书类型，填写关键信息后 AI 将自动生成规范文书
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
      }}>
        {DOC_TYPES.map((item, i) => (
          <button
            key={item.docType}
            onClick={() => onSelect(item.docType)}
            className="animate-fade-up"
            style={{
              animationDelay: `${i * 60}ms`,
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
              padding: '12px 14px', borderRadius: 10,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s',
              boxShadow: 'var(--shadow-card)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-default)'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-card)'
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: DOC_COLORS[item.docType],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {DOC_ICONS[item.docType]}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                {item.label}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                {item.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
