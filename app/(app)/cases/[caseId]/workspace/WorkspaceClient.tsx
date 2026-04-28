'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, FileText, Zap, Search, Send, Loader2, X,
  Sparkles, ChevronDown, ChevronUp, Scale, Folder
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
    <div style={{ display: 'flex', height: '100vh', background: '#f5f6fa', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif" }}>

      {/* Left sidebar */}
      <aside style={{ width: 220, display: 'flex', flexDirection: 'column', background: '#fff', borderRight: '1px solid #ebebf0', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f0f0f5' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
              <path d="M12 28 L20 12 L28 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M15 23 L25 23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>Linkmai</span>
        </div>

        <div style={{ padding: '10px 10px 4px' }}>
          <Link href={`/cases/${caseData.id}`} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 8, fontSize: 12, color: '#888', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <ArrowLeft size={13} />返回案件
          </Link>
        </div>

        {/* Case info */}
        <div style={{ padding: '0 10px 10px' }}>
          <button onClick={() => setCaseExpanded(!caseExpanded)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '7px 10px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#555' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Scale size={13} style={{ color: '#2563eb' }} />案件信息
            </span>
            {caseExpanded ? <ChevronUp size={12} style={{ color: '#bbb' }} /> : <ChevronDown size={12} style={{ color: '#bbb' }} />}
          </button>
          {caseExpanded && (
            <div style={{ padding: '6px 10px 4px', background: '#f8f8fb', borderRadius: 8, marginTop: 4 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: 6 }}>{caseData.title}</p>
              {caseData.client_name && <p style={{ fontSize: 11, color: '#aaa', marginBottom: 3 }}>当事人：{caseData.client_name}</p>}
              {caseData.opponent && <p style={{ fontSize: 11, color: '#aaa', marginBottom: 3 }}>对方：{caseData.opponent}</p>}
              {caseData.court && <p style={{ fontSize: 11, color: '#aaa', marginBottom: 3 }}>法院：{caseData.court}</p>}
              {caseData.description && <p style={{ fontSize: 11, color: '#bbb', lineHeight: 1.5, marginTop: 6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{caseData.description}</p>}
            </div>
          )}
        </div>

        {/* Documents list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 10px', borderTop: '1px solid #f0f0f5' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: '0.06em', padding: '10px 10px 6px', textTransform: 'uppercase' as const }}>文书 ({documents.length})</p>
          {documents.length === 0 ? (
            <p style={{ fontSize: 12, color: '#ccc', padding: '0 10px' }}>暂无文书</p>
          ) : (
            documents.map(doc => (
              <Link key={doc.id} href={`/cases/${caseData.id}/documents/${doc.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: 12, color: '#666', textDecoration: 'none', marginBottom: 1 }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <FileText size={13} style={{ color: '#2563eb', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{doc.title}</span>
              </Link>
            ))
          )}
        </div>

        {/* Nav */}
        <div style={{ padding: '10px', borderTop: '1px solid #f0f0f5' }}>
          <Link href="/cases" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: 12, color: '#888', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Folder size={13} />所有案件
          </Link>
        </div>
      </aside>

      {/* Center: Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#fff', borderBottom: '1px solid #ebebf0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={15} style={{ color: '#2563eb' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>AI 工作台</span>
            <span style={{ fontSize: 12, color: '#ccc', margin: '0 4px' }}>·</span>
            <span style={{ fontSize: 12, color: '#aaa' }}>{caseData.title}</span>
          </div>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 8, background: '#f0f0f5' }}>
            {([
              { key: 'draft', icon: FileText, label: '起草文书' },
              { key: 'search', icon: Search, label: '法律检索' },
            ] as const).map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => setMode(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: mode === key ? 600 : 400,
                  background: mode === key ? '#fff' : 'transparent',
                  color: mode === key ? '#111' : '#888',
                  boxShadow: mode === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}>
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'system' ? (
                <div style={{ width: '100%', maxWidth: 640, padding: '12px 16px', borderRadius: 10, background: '#f5f6fa', border: '1px solid #ebebf0', fontSize: 13, color: '#666', lineHeight: 1.7 }}>
                  <MessageContent content={msg.content} />
                </div>
              ) : msg.role === 'user' ? (
                <div style={{ maxWidth: '68%', padding: '10px 14px', borderRadius: 12, borderBottomRightRadius: 4, background: '#111', color: '#fff', fontSize: 13, lineHeight: 1.6 }}>
                  {msg.content}
                </div>
              ) : (
                <div style={{ maxWidth: '84%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {msg.toolActivity && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 8, background: '#f0f4ff', border: '1px solid #dce8ff', fontSize: 12, color: '#2563eb' }}>
                      <Sparkles size={13} style={{ animation: 'spin 1.2s linear infinite', flexShrink: 0 }} />
                      {msg.toolActivity}
                    </div>
                  )}
                  {(msg.content || msg.isStreaming) && (
                    <div style={{ padding: '12px 16px', borderRadius: 12, borderBottomLeftRadius: 4, background: '#fff', border: '1px solid #ebebf0', fontSize: 13, color: '#333', lineHeight: 1.8 }}>
                      <div className={msg.isStreaming && msg.content ? 'streaming-cursor' : ''}>
                        <MessageContent content={msg.content} />
                      </div>
                      {msg.isStreaming && !msg.content && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#bbb' }}>
                          <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
                          <span style={{ fontSize: 12 }}>思考中...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '12px 20px 16px', background: '#fff', borderTop: '1px solid #ebebf0', flexShrink: 0 }}>
          {mode === 'draft' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#aaa' }}>文书类型</span>
              <select value={docType} onChange={e => setDocType(e.target.value)}
                style={{ height: 28, padding: '0 8px', borderRadius: 6, border: '1px solid #e0e0e8', background: '#fafafa', fontSize: 12, color: '#555', outline: 'none' }}>
                {DOC_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, borderRadius: 10, border: '1px solid #e0e0e8', background: '#fafafa', overflow: 'hidden' }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={loading}
                style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#111', resize: 'none', lineHeight: 1.6 }}
                placeholder={mode === 'draft' ? '描述你需要起草的文书，如：帮我起草一份劳动合同纠纷起诉状...' : '输入检索内容，如：劳动合同解除的法定条件...'}
              />
            </div>
            <button onClick={handleSend} disabled={loading || !input.trim()}
              style={{ width: 38, height: 38, borderRadius: 9, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading || !input.trim() ? 'default' : 'pointer', flexShrink: 0, background: loading || !input.trim() ? '#f0f0f5' : '#111', color: loading || !input.trim() ? '#bbb' : '#fff', transition: 'all 0.15s' }}>
              {loading ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={15} />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#ccc', marginTop: 6 }}>Enter 发送 · Shift+Enter 换行</p>
        </div>
      </div>

      {/* Right: Document preview */}
      {showPreview && (
        <div style={{ width: 400, display: 'flex', flexDirection: 'column', background: '#fff', borderLeft: '1px solid #ebebf0', flexShrink: 0 }}>
          <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', borderBottom: '1px solid #ebebf0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <FileText size={14} style={{ color: '#2563eb' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>文书预览</span>
            </div>
            <button onClick={() => setShowPreview(false)}
              style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <X size={15} />
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px' }}>
            {previewContent ? (
              <pre style={{ fontSize: 13, whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#333', lineHeight: 1.9 }}>
                {previewContent}
              </pre>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f5f5f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} style={{ color: '#ccc' }} />
                </div>
                <p style={{ fontSize: 13, color: '#bbb' }}>文书生成后将在此预览</p>
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
          ? <strong key={i} style={{ color: '#111' }}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}
