'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, FileText, Zap, Search, Send, Loader2, X,
  Sparkles, ChevronDown, ChevronUp, Scale, Folder, LayoutDashboard, Settings,
  Download, ClipboardList,
} from 'lucide-react'
import type { Case, Document, StreamChunk, DraftPlan, DocType } from '@/lib/types'
import GuidedDraftPanel from './GuidedDraftPanel'
import MaterialsPanel from './MaterialsPanel'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  isStreaming?: boolean
  toolActivity?: string
  plan?: DraftPlan
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
  const [docType, setDocType] = useState<DocType>('complaint')
  const [mode, setMode] = useState<'draft' | 'search' | 'materials'>('draft')
  const [draftSubMode, setDraftSubMode] = useState<'guided' | 'free'>('guided')
  const [previewContent, setPreviewContent] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [showPreview, setShowPreview] = useState(false)
  const [caseExpanded, setCaseExpanded] = useState(true)
  const [injectedContext, setInjectedContext] = useState<{ type: 'materials' | 'search'; text: string } | null>(null)
  const [lastSearchSummary, setLastSearchSummary] = useState<string | null>(null)
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

  const handleGuidedGenerate = (instruction: string, selectedDocType: DocType) => {
    setDocType(selectedDocType)
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: `起草${selectedDocType === 'complaint' ? '起诉状' : selectedDocType === 'defense' ? '答辩状' : selectedDocType === 'lawyer_letter' ? '律师函' : selectedDocType === 'contract' ? '合同' : selectedDocType === 'motion' ? '申请书' : '文书'}` }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    handleDraft(instruction, selectedDocType).then(() => setLoading(false))
  }

  const handleDraft = async (instruction: string, overrideDocType?: DocType) => {
    const assistantId = Date.now().toString() + '-a'
    let accumulated = ''
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', isStreaming: true }])
    setPreviewContent('')
    setCurrentDocId(null)
    setShowPreview(true)

    try {
      const res = await fetch('/api/agent/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: caseData.id, docType: overrideDocType ?? docType, instruction, conversationId: 'workspace' }),
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
            } else if (chunk.type === 'plan') {
              setMessages(prev => prev.map(m => m.id === assistantId
                ? { ...m, plan: chunk.plan, toolActivity: '规划完成，开始起草...' }
                : m))
            } else if (chunk.type === 'tool_call') {
              const activity = chunk.name === 'planning' ? '正在分析案情，制定起草方案...'
                : chunk.name === 'search_legal_database' ? '正在检索相关法律法规...'
                : chunk.name === 'get_document_template' ? '正在获取文书模板...'
                : chunk.name === 'save_document_draft' ? '正在保存文书...'
                : `调用工具：${chunk.name}`
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, toolActivity: activity } : m))
            } else if (chunk.type === 'done') {
              if (chunk.document_id) {
                setCurrentDocId(chunk.document_id)
                const savedDoc = documents.find(d => d.id === chunk.document_id)
                if (savedDoc) setPreviewTitle(savedDoc.title)
              }
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false, toolActivity: undefined } : m))
              const docsRes = await fetch(`/api/documents?caseId=${caseData.id}`)
              if (docsRes.ok) {
                const updatedDocs = await docsRes.json()
                setDocuments(updatedDocs)
                if (chunk.document_id) {
                  const newDoc = updatedDocs.find((d: Document) => d.id === chunk.document_id)
                  if (newDoc) setPreviewTitle(newDoc.title)
                }
              }
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

  const handleExportWord = async () => {
    if (!currentDocId) return
    const res = await fetch(`/api/documents/${currentDocId}/export`)
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${previewTitle || '文书'}.docx`
    a.click()
    URL.revokeObjectURL(url)
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
      setLastSearchSummary(data.summary || null)
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
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid #f0f0f5' }}>
          <img src="/logo.png" alt="Linkmai" style={{ width: 30, height: 30, filter: 'brightness(0) drop-shadow(0 0 0.5px #000) drop-shadow(0 0 0.5px #000)' }} />
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
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: 12, color: '#888', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <LayoutDashboard size={13} />使用日志
          </Link>
          <Link href="/cases" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: 12, color: '#888', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Folder size={13} />所有案件
          </Link>
          <Link href="/pricing" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 8, fontSize: 12, color: '#2563eb', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={13} />升级套餐</span>
            <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#f0f4ff', color: '#2563eb' }}>免费版</span>
          </Link>
          <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: 12, color: '#888', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Settings size={13} />设置
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
              { key: 'materials', icon: ClipboardList, label: '材料整理' },
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

        {/* Materials mode */}
        {mode === 'materials' ? (
          <MaterialsPanel
            caseData={caseData}
            onInjectContext={(text) => {
              setInjectedContext({ type: 'materials', text })
              setMode('draft')
            }}
          />
        ) : (
          <>
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
                      <Sparkles size={13} style={{ animation: msg.isStreaming ? 'spin 1.2s linear infinite' : 'none', flexShrink: 0 }} />
                      {msg.toolActivity}
                    </div>
                  )}
                  {msg.plan && <PlanCard plan={msg.plan} />}
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

        {mode === 'search' && lastSearchSummary && !loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 0' }}>
            <button
              onClick={() => {
                setInjectedContext({ type: 'search', text: `【相关法律检索结果】\n${lastSearchSummary}` })
                setMode('draft')
                setLastSearchSummary(null)
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 7, border: '1px solid #d0d8ff', background: '#f8faff', cursor: 'pointer', fontSize: 12, color: '#2563eb' }}>
              注入起草上下文 →
            </button>
          </div>
        )}

        {/* Input area */}
        {mode === 'draft' && draftSubMode === 'guided' ? (
          <GuidedDraftPanel
            caseData={caseData}
            onGenerateStart={handleGuidedGenerate}
            onDocumentSaved={(docId) => setCurrentDocId(docId)}
            onSwitchToFree={() => setDraftSubMode('free')}
            injectedContext={injectedContext?.text ?? null}
            onContextConsumed={() => setInjectedContext(null)}
          />
        ) : (
        <div style={{ padding: '12px 20px 16px', background: '#fff', borderTop: '1px solid #ebebf0', flexShrink: 0 }}>
          {mode === 'draft' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#aaa' }}>文书类型</span>
                <select value={docType} onChange={e => setDocType(e.target.value as DocType)}
                  style={{ height: 28, padding: '0 8px', borderRadius: 6, border: '1px solid #e0e0e8', background: '#fafafa', fontSize: 12, color: '#555', outline: 'none' }}>
                  <option value="complaint">起诉状</option>
                  <option value="defense">答辩状</option>
                  <option value="contract">合同</option>
                  <option value="lawyer_letter">律师函</option>
                  <option value="motion">申请书</option>
                  <option value="other">其他文书</option>
                </select>
              </div>
              {draftSubMode === 'free' && (
                <button onClick={() => setDraftSubMode('guided')} style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>
                  引导起草 →
                </button>
              )}
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
                placeholder={mode === 'draft' ? '描述你需要起草的文书...' : '输入检索内容，如：劳动合同解除的法定条件...'}
              />
            </div>
            <button onClick={handleSend} disabled={loading || !input.trim()}
              style={{ width: 38, height: 38, borderRadius: 9, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading || !input.trim() ? 'default' : 'pointer', flexShrink: 0, background: loading || !input.trim() ? '#f0f0f5' : '#111', color: loading || !input.trim() ? '#bbb' : '#fff', transition: 'all 0.15s' }}>
              {loading ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={15} />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#ccc', marginTop: 6 }}>Enter 发送 · Shift+Enter 换行</p>
        </div>
        )}
      </>
      )}
      </div>

      {/* Right: Document preview */}
      {mode !== 'materials' && showPreview && (
        <div style={{ width: 400, display: 'flex', flexDirection: 'column', background: '#fff', borderLeft: '1px solid #ebebf0', flexShrink: 0 }}>
          <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', borderBottom: '1px solid #ebebf0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <FileText size={14} style={{ color: '#2563eb' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>文书预览</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {currentDocId && (
                <button onClick={handleExportWord}
                  className="btn-outline"
                  style={{ height: 30, padding: '0 12px', fontSize: 12, borderRadius: 7 }}>
                  <Download size={13} />
                  导出 Word
                </button>
              )}
              <button onClick={() => setShowPreview(false)}
                style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <X size={15} />
              </button>
            </div>
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

function PlanCard({ plan }: { plan: DraftPlan }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{ borderRadius: 10, border: '1px solid #e0e8ff', background: '#f8faff', overflow: 'hidden', fontSize: 12 }}>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontWeight: 600, fontSize: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={12} />
          起草方案已生成
        </span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {expanded && (
        <div style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #e0e8ff' }}>
          {plan.keyFacts.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4, marginTop: 10 }}>关键事实</p>
              <ul style={{ margin: 0, paddingLeft: 16, color: '#444', lineHeight: 1.7 }}>
                {plan.keyFacts.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}
          {plan.legalIssues.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4 }}>法律问题</p>
              <ul style={{ margin: 0, paddingLeft: 16, color: '#444', lineHeight: 1.7 }}>
                {plan.legalIssues.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </div>
          )}
          {plan.outline.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4 }}>文书大纲</p>
              <ol style={{ margin: 0, paddingLeft: 16, color: '#444', lineHeight: 1.7 }}>
                {plan.outline.map((o, i) => <li key={i}>{o}</li>)}
              </ol>
            </div>
          )}
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
