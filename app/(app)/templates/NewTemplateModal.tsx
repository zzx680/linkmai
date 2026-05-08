'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { DraftTemplate, DocType } from '@/lib/types'

const DOC_TYPE_OPTIONS: { value: DocType | string; label: string }[] = [
  { value: 'complaint', label: '起诉状' },
  { value: 'defense', label: '答辩状' },
  { value: 'contract', label: '合同' },
  { value: 'lawyer_letter', label: '律师函' },
  { value: 'motion', label: '申请书' },
  { value: 'other', label: '其他文书' },
]

interface Props {
  template: DraftTemplate | null
  onClose: () => void
  onSaved: (template: DraftTemplate, isNew: boolean) => void
}

export default function NewTemplateModal({ template, onClose, onSaved }: Props) {
  const isEdit = !!template
  const [title, setTitle] = useState(template?.title || '')
  const [docType, setDocType] = useState(template?.doc_type || 'complaint')
  const [promptMd, setPromptMd] = useState(template?.prompt_md || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !promptMd.trim()) return
    setSaving(true)
    try {
      const url = isEdit ? `/api/templates/${template!.id}` : '/api/templates'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), doc_type: docType, prompt_md: promptMd.trim() }),
      })
      if (res.ok) {
        const saved = await res.json()
        onSaved(saved, !isEdit)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: 520, maxHeight: '90vh', background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f0f0f5' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{isEdit ? '编辑模板' : '新建模板'}</span>
          <button onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: '#f5f5f8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>模板名称</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)} placeholder="如：劳动争议起诉状模板"
              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #e0e0e8', background: '#fafafa', fontSize: 13, color: '#111', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>适用文书类型</label>
            <select value={docType} onChange={e => setDocType(e.target.value)}
              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #e0e0e8', background: '#fafafa', fontSize: 13, color: '#555', outline: 'none' }}>
              {DOC_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>提示词内容</label>
            <textarea
              value={promptMd} onChange={e => setPromptMd(e.target.value)} placeholder="描述此模板的起草要求和注意事项..."
              rows={10}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e8', background: '#fafafa', fontSize: 13, color: '#111', outline: 'none', resize: 'vertical', lineHeight: 1.6, minHeight: 160 }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 22px', borderTop: '1px solid #f0f0f5' }}>
          <button onClick={onClose}
            style={{ height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #e0e0e8', background: '#fff', fontSize: 13, color: '#666', cursor: 'pointer' }}>
            取消
          </button>
          <button onClick={handleSubmit} disabled={saving || !title.trim() || !promptMd.trim()}
            style={{ height: 36, padding: '0 18px', borderRadius: 8, border: 'none', background: saving || !title.trim() || !promptMd.trim() ? '#e0e0e8' : '#111', color: saving || !title.trim() || !promptMd.trim() ? '#aaa' : '#fff', fontSize: 13, fontWeight: 500, cursor: saving ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {saving && <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />}
            {isEdit ? '保存修改' : '创建模板'}
          </button>
        </div>
      </div>
    </div>
  )
}
