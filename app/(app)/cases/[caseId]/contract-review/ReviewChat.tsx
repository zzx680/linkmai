'use client'

import { useState, useRef, useEffect } from 'react'
import type { ColumnResult } from './ReviewTable'
import { Send, Loader2 } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

function buildContext(results: ColumnResult[]): string {
  const COLUMNS = ['合同主体', '合同金额', '履行期限', '核心义务', '违约责任', '争议解决', '保密条款', '风险条款']
  return results.map(r => `【${COLUMNS[r.column_index] ?? r.column_index}】${r.summary}（${r.flag}）`).join('\n')
}

export default function ReviewChat({ results }: { results: ColumnResult[] }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setLoading(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const res = await fetch('/api/contract-review/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          extractionContext: results.length ? buildContext(results) : '',
        }),
      })

      if (!res.ok || !res.body) throw new Error('请求失败')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const chunk = JSON.parse(line.slice(6))
            if (chunk.type === 'text') {
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + chunk.content,
                }
                return updated
              })
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: '对话失败，请重试。' }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  const hasResults = results.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 500 }}>
      {/* Context hint */}
      {hasResults && (
        <div style={{ padding: '10px 16px', background: '#f0f4ff', borderRadius: 10, marginBottom: 16, fontSize: 12, color: '#2563eb' }}>
          AI 已读取合同分析结果，可直接提问
        </div>
      )}
      {!hasResults && (
        <div style={{ padding: '10px 16px', background: '#fffbeb', borderRadius: 10, marginBottom: 16, fontSize: 12, color: '#d97706' }}>
          建议先完成"提取分析"，AI 将基于分析结果回答问题
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 8 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 13, color: '#aaa', marginBottom: 16 }}>可以问我关于这份合同的任何问题</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {['这份合同的主要风险是什么？', '违约责任条款是否合理？', '建议如何修改争议解决条款？'].map(q => (
                <button key={q} onClick={() => setInput(q)} style={{ padding: '7px 14px', borderRadius: 20, border: '1px solid #e0e0e8', background: '#fff', fontSize: 12, color: '#555', cursor: 'pointer' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user' ? '#111' : '#fff',
              color: msg.role === 'user' ? '#fff' : '#333',
              fontSize: 13, lineHeight: 1.7,
              border: msg.role === 'assistant' ? '1px solid #ebebf0' : 'none',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content || (loading && i === messages.length - 1 ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#aaa' }}>
                  <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />思考中...
                </span>
              ) : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #f0f0f5', marginTop: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="提问关于这份合同的问题..."
          style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid #e0e0e8', padding: '0 14px', fontSize: 14, color: '#111', outline: 'none', background: '#fafafa' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{ width: 44, height: 44, borderRadius: 10, border: 'none', background: input.trim() && !loading ? '#111' : '#e0e0e8', color: input.trim() && !loading ? '#fff' : '#aaa', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <Send size={16} />
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
