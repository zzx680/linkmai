'use client'

import { useState } from 'react'
import type { Case, DraftTemplate, DocType } from '@/lib/types'
import { DOC_FORM_SCHEMAS } from '@/lib/draft-forms/schemas'
import { buildStructuredPrompt } from '@/lib/draft-forms/prompt-builder'
import DocTypeSelector from './DocTypeSelector'
import StepForm from './StepForm'
import type { FormData } from '@/lib/draft-forms/types'
import { ArrowLeft, FileText, BookOpen, ChevronRight } from 'lucide-react'

interface Props {
  caseData: Case
  onGenerateStart: (instruction: string, docType: DocType) => void
  onDocumentSaved?: (docId: string) => void
  onSwitchToFree: () => void
  injectedContext?: string | null
  onContextConsumed?: () => void
}

type GuidedState = 'type-select' | 'template-select' | 'form' | 'generating'

export default function GuidedDraftPanel({ caseData, onGenerateStart, onSwitchToFree, injectedContext, onContextConsumed }: Props) {
  const [state, setState] = useState<GuidedState>('type-select')
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null)
  const [formData, setFormData] = useState<FormData>({})
  const [templates, setTemplates] = useState<DraftTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<DraftTemplate | null>(null)

  const handleDocTypeSelect = async (docType: DocType) => {
    setSelectedDocType(docType)
    setFormData({})
    setSelectedTemplate(null)
    try {
      const res = await fetch(`/api/templates?docType=${docType}`)
      const data = res.ok ? await res.json() : []
      setTemplates(data)
      setState(data.length > 0 ? 'template-select' : 'form')
    } catch {
      setTemplates([])
      setState('form')
    }
  }

  const handleTemplateSelect = (template: DraftTemplate | null) => {
    setSelectedTemplate(template)
    setState('form')
  }

  const handleFormChange = (key: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleGenerate = () => {
    if (!selectedDocType) return
    let instruction = buildStructuredPrompt(selectedDocType, formData)
    if (selectedTemplate) {
      instruction += `\n\n【起草要求（来自模板：${selectedTemplate.title}）】\n${selectedTemplate.prompt_md}`
    }
    if (injectedContext) {
      instruction += `\n\n${injectedContext}`
      onContextConsumed?.()
    }
    setState('generating')
    onGenerateStart(instruction, selectedDocType)
  }

  const handleBack = () => {
    if (state === 'generating' || state === 'form') {
      setState(templates.length > 0 ? 'template-select' : 'type-select')
      if (templates.length === 0) setSelectedDocType(null)
    } else if (state === 'template-select') {
      setState('type-select')
      setSelectedDocType(null)
    }
  }

  const schema = selectedDocType ? DOC_FORM_SCHEMAS.find(s => s.docType === selectedDocType) : null

  return (
    <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', padding: '16px 20px 12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {state !== 'type-select' && (
            <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, border: 'none', background: 'var(--bg-elevated)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12 }}>
              <ArrowLeft size={13} />
              {state === 'generating' ? '重新选择' : '返回'}
            </button>
          )}
          {schema && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} style={{ color: 'var(--accent-500)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{schema.label}</span>
              {selectedTemplate && (
                <>
                  <ChevronRight size={12} style={{ color: '#bbb' }} />
                  <span style={{ fontSize: 12, color: '#2563eb' }}>{selectedTemplate.title}</span>
                </>
              )}
            </div>
          )}
        </div>

        {state === 'generating' ? (
          <div style={{ padding: '4px 12px', borderRadius: 999, background: 'var(--accent-dim)', color: 'var(--accent-500)', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-500)', animation: 'blink 1s infinite' }} />
            AI 正在起草中...
          </div>
        ) : (
          <button onClick={onSwitchToFree} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 12 }}>
            自由输入
          </button>
        )}
      </div>

      {/* Content */}
      {state === 'type-select' && <DocTypeSelector onSelect={handleDocTypeSelect} />}

      {state === 'template-select' && (
        <TemplateSelector templates={templates} onSelect={handleTemplateSelect} />
      )}

      {state === 'form' && schema && (
        <>
          {injectedContext && (
            <div style={{ margin: '0 0 12px', padding: '8px 12px', borderRadius: 8, background: '#f0f4ff', border: '1px solid #d0d8ff', fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#2563eb' }}>已注入上下文</span>
                <button onClick={onContextConsumed} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#aaa', fontSize: 11, padding: 0 }}>清除</button>
              </div>
              <p style={{ color: '#555', lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                {injectedContext}
              </p>
            </div>
          )}
          <StepForm schema={schema} formData={formData} onChange={handleFormChange} onGenerate={handleGenerate} isGenerating={false} />
        </>
      )}

      {state === 'generating' && (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
          请在上方对话区查看 AI 生成进度，文书将在右侧预览
        </div>
      )}
    </div>
  )
}

function TemplateSelector({ templates, onSelect }: {
  templates: DraftTemplate[]
  onSelect: (template: DraftTemplate | null) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 12, color: '#888', margin: '0 0 4px' }}>选择一个起草模板，或直接跳过</p>

      <button onClick={() => onSelect(null)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, border: '1px dashed #d0d0dc', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#888', textAlign: 'left' as const }}>
        <span>不使用模板，直接填写</span>
        <ChevronRight size={14} style={{ color: '#ccc' }} />
      </button>

      {templates.map(t => (
        <button key={t.id} onClick={() => onSelect(t)}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, border: '1px solid #e0e8ff', background: '#f8faff', cursor: 'pointer', textAlign: 'left' as const, gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <BookOpen size={12} style={{ color: '#2563eb', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{t.title}</span>
              {t.is_system && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#f0f0f5', color: '#888' }}>内置</span>}
            </div>
            <p style={{ fontSize: 11, color: '#888', margin: 0, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
              {t.prompt_md.slice(0, 80)}...
            </p>
          </div>
          <ChevronRight size={14} style={{ color: '#2563eb', flexShrink: 0, marginTop: 2 }} />
        </button>
      ))}
    </div>
  )
}
