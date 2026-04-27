'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, FileText, Zap, Search, Send, Loader2, X,
  Sparkles, ChevronDown, ChevronUp, Scale
} from 'lucide-react'
import type { Case, Document, StreamChunk } from '@/lib/types'

const DOC_TYPE_OPTIONS = [
  { value: 'complaint', label: '起诉状' },
  { value: 'defense', label: '答辩状' },
  { value: 'contract', label: '合同' },
  { value: 'lawyer_letter', label: '律师函' },
  { value: 'motion', label: '申请书' },
  { value: 'other', label: '其他文书' },
]

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  isStreaming?: boolean
  toolActivity?: string
}

interface Props {
  caseData: Case
  initialDocuments: Document[]
}

export default function WorkspaceClient({ caseData, initialDocuments }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'system',
      content: `已加载案件：**${caseData.title}**\n\n你可以让我起草文书，或者进行法律检索。`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [docType, setDocType] = useState('complaint')
  const [mode, setMode] = useState<'draft' | 'search'>('draft')
  const [previewContent, setPreviewContent] = useState('')
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [showPreview, setShowPreview] = useState(false)
  const [caseExpanded, setCaseExpanded] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    if (mode === 'draft') await handleDraft(input)
    else await handleSearch(input)
    setLoading(false)
  }

  const handleDraft = async (instruction: string) => {
    const assistantId = Date.now().toString() + '-a'
    let accumulated = ''
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', isStreaming: true }])
    setPreviewContent('')
    setShowPreview(true)

    try {
      const res = await fetch('/api/agent/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: caseData.id, docType, instruction, conversationId: 'workspace' }),
      })
      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const chunk: StreamChunk = JSON.parse(line.slice(6))
            if (chunk.type === 'text') {
              accumulated += chunk.content
              setPreviewContent(accumulated)
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m))
            } else if (chunk.type === 'tool_call') {
              const activity = chunk.name === 'search_legal_database' ? '正在检索法律数据库...'
                : chunk.name === 'get_document_template' ? '正在获取文书模板...'
                : chunk.name === 'save_document_draft' ? '正在保存文书...'
                : `调用工具：${chunk.name}`
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, toolActivity: activity } : m))
            } else if (chunk.type === 'done') {
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false, toolActivity: undefined } : m))
              const docsRes = await fetch(`/api/documents?caseId=${caseData.id}`)
              if (docsRes.ok) setDocuments(await docsRes.json())
            } else if (chunk.type === 'error') {
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: `起草失败：${chunk.message}`, isStreaming: false } : m))
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: `请求失败：${String(e)}`, isStreaming: false } : m))
    }
  }

  const handleSearch = async (query: string) => {
    const assistantId = Date.now().toString() + '-a'
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', isStreaming: true, toolActivity: '正在检索法律数据库...' }])
    try {
      const res = await fetch('/api/agent/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, caseId: caseData.id }),
      })
      const data = await res.json()
      setMessages(prev => prev.map(m => m.id === assistantId
        ? { ...m, content: data.summary || '未找到相关结果', isStreaming: false, toolActivity: undefined }
        : m))
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === assistantId
        ? { ...m, content: `检索失败：${String(e)}`, isStreaming: false, toolActivity: undefined }
        : m))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Left sidebar: case context */}
      <aside className="w-[240px] flex flex-col shrink-0"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}>
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent-600), var(--accent-700))' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>LinkMai</span>
        </div>

        <div className="px-4 pb-2">
          <Link href={`/cases/${caseData.id}`}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-[var(--radius-md)] transition-colors"
            style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            返回案件
          </Link>
        </div>

        {/* Case info collapsible */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setCaseExpanded(!caseExpanded)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-md)] text-xs font-medium"
            style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" style={{ color: 'var(--accent-400)' }} />
              案件信息
            </span>
            {caseExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {caseExpanded && (
            <div className="mt-1.5 px-2.5 space-y-1.5">
              <p className="text-xs font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{caseData.title}</p>
              {caseData.client_name && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>当事人：{caseData.client_name}</p>}
              {caseData.opponent && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>对方：{caseData.opponent}</p>}
              {caseData.court && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>法院：{caseData.court}</p>}
              {caseData.description && (
                <p className="text-xs line-clamp-3 mt-1.5" style={{ color: 'var(--text-tertiary)' }}>{caseData.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="flex-1 overflow-auto px-3 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-xs font-medium px-2.5 py-2" style={{ color: 'var(--text-secondary)' }}>
            文书 ({documents.length})
          </p>
          {documents.length === 0 ? (
            <p className="text-xs px-2.5" style={{ color: 'var(--text-tertiary)' }}>暂无文书</p>
          ) : (
            <div className="space-y-0.5">
              {documents.map(doc => (
                <Link key={doc.id} href={`/cases/${caseData.id}/documents/${doc.id}`}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-md)] text-xs transition-colors"
                  style={{ color: 'var(--text-secondary)' }}>
                  <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-400)' }} />
                  <span className="truncate">{doc.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Center: Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: 'var(--accent-400)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>AI 工作台</span>
          </div>
          <div className="flex gap-1 p-1 rounded-[var(--radius-md)]" style={{ background: 'var(--bg-elevated)' }}>
            {([
              { key: 'draft', icon: FileText, label: '起草文书' },
              { key: 'search', icon: Search, label: '法律检索' },
            ] as const).map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => setMode(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium"
                style={{
                  background: mode === key ? 'var(--accent-600)' : 'transparent',
                  color: mode === key ? '#fff' : 'var(--text-secondary)',
                }}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto px-5 py-5 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
              {msg.role === 'system' ? (
                <div className="w-full max-w-2xl px-4 py-3 rounded-[var(--radius-lg)] text-sm"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <MessageContent content={msg.content} />
                </div>
              ) : msg.role === 'user' ? (
                <div className="max-w-[72%] px-4 py-2.5 rounded-[18px] rounded-tr-[4px] text-sm"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                  {msg.content}
                </div>
              ) : (
                <div className="max-w-[86%] space-y-2">
                  {msg.toolActivity && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-xs"
                      style={{ background: 'rgba(108,92,231,0.10)', color: 'var(--accent-400)', border: '1px solid rgba(108,92,231,0.15)' }}>
                      <Sparkles className="w-3.5 h-3.5 shrink-0 spin" />
                      {msg.toolActivity}
                    </div>
                  )}
                  {(msg.content || msg.isStreaming) ? (
                    <div className="px-4 py-3 rounded-[var(--radius-lg)] text-sm leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}>
                      <div className={msg.isStreaming && msg.content ? 'streaming-cursor' : ''}>
                        <MessageContent content={msg.content} />
                      </div>
                      {msg.isStreaming && !msg.content && (
                        <div className="flex items-center gap-2 mt-2" style={{ color: 'var(--text-tertiary)' }}>
                          <Loader2 className="w-3.5 h-3.5 spin" />
                          <span className="text-xs">思考中...</span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area — sticky bottom with backdrop blur */}
        <div className="px-5 pb-5 pt-3 shrink-0"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(20,20,26,0.85)',
            backdropFilter: 'blur(12px)',
          }}>
          {mode === 'draft' && (
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>文书类型</span>
              <select value={docType} onChange={e => setDocType(e.target.value)}
                className="input-base text-xs py-1" style={{ width: 'auto' }}>
                {DOC_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <div className="flex-1 rounded-[var(--radius-xl)] overflow-hidden"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={loading}
                className="w-full px-4 py-3 text-sm resize-none outline-none"
                style={{ background: 'transparent', color: 'var(--text-primary)' }}
                placeholder={mode === 'draft'
                  ? '描述你需要起草的文书，如：帮我起草一份劳动合同纠纷起诉状...'
                  : '输入检索内容，如：劳动合同解除的法定条件...'}
              />
            </div>
            <button onClick={handleSend} disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center transition-all shrink-0"
              style={{
                background: loading || !input.trim()
                  ? 'var(--bg-elevated)'
                  : 'linear-gradient(135deg, var(--accent-600), var(--accent-700))',
                color: loading || !input.trim() ? 'var(--text-tertiary)' : '#fff',
                boxShadow: (loading || !input.trim()) ? 'none' : 'var(--shadow-accent)',
              }}>
              {loading ? <Loader2 className="w-4 h-4 spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>Enter 发送 · Shift+Enter 换行</p>
        </div>
      </div>

      {/* Right: Document preview */}
      {showPreview && (
        <div className="w-[420px] flex flex-col shrink-0"
          style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: 'var(--accent-400)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>文书预览</span>
            </div>
            <button onClick={() => setShowPreview(false)}
              className="p-1 rounded-[var(--radius-sm)] transition-colors"
              style={{ color: 'var(--text-tertiary)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-5">
            {previewContent ? (
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}>
                {previewContent}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <Sparkles className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>文书生成后将在此预览</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MessageContent({ content }: { content: string }) {
  if (!content) return null
  const parts = content.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}
