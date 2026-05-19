'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Sidebar from '@/app/components/Sidebar'
import ReviewTable, { type ColumnResult } from './ReviewTable'
import ReviewChat from './ReviewChat'
import { FileSearch, Upload, Loader2, ChevronLeft, FileText, MessageSquare } from 'lucide-react'
import type { Case } from '@/lib/types'

type Tab = 'extract' | 'chat'

export default function ContractReviewClient({ caseData }: { caseData: Case }) {
  const [tab, setTab] = useState<Tab>('extract')
  const [contractText, setContractText] = useState('')
  const [contractName, setContractName] = useState('合同文本')
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<ColumnResult[]>([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    setContractName(file.name)
    if (file.type === 'text/plain') {
      const text = await file.text()
      setContractText(text)
    } else {
      // For PDF, use the upload API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('caseId', caseData.id)
      const res = await fetch('/api/materials/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setContractText(data.content || '')
      } else {
        setError('文件解析失败，请粘贴文本内容')
      }
    }
  }

  const handleAnalyze = async () => {
    if (!contractText.trim()) { setError('请输入或上传合同文本'); return }
    setAnalyzing(true)
    setResults([])
    setProgress(0)
    setError('')

    try {
      const res = await fetch('/api/contract-review/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText, contractName }),
      })

      if (!res.ok || !res.body) throw new Error('分析请求失败')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      const collected: ColumnResult[] = []

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
            if (chunk.type === 'column_result') {
              collected.push(chunk)
              setResults([...collected])
              setProgress(Math.round((collected.length / 8) * 100))
            } else if (chunk.type === 'done') {
              setProgress(100)
            } else if (chunk.type === 'error') {
              setError(chunk.message)
            }
          } catch {}
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败，请重试')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f6fa', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', background: '#fff', borderBottom: '1px solid #ebebf0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href={`/cases/${caseData.id}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#aaa', textDecoration: 'none', fontSize: 13 }}
              onMouseEnter={e => e.currentTarget.style.color = '#555'}
              onMouseLeave={e => e.currentTarget.style.color = '#aaa'}>
              <ChevronLeft size={14} />{caseData.title}
            </Link>
            <span style={{ fontSize: 13, color: '#ccc' }}>/</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileSearch size={14} style={{ color: '#aaa' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>合同审查</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, background: '#f5f5f8', borderRadius: 8, padding: 3 }}>
            {([['extract', FileText, '提取分析'], ['chat', MessageSquare, 'AI 对话']] as const).map(([key, Icon, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 30, padding: '0 14px', borderRadius: 6, border: 'none',
                background: tab === key ? '#fff' : 'transparent',
                color: tab === key ? '#111' : '#888',
                fontSize: 13, fontWeight: tab === key ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>

          {/* ── Extract tab ── */}
          {tab === 'extract' && (
            <div style={{ maxWidth: 860, margin: '0 auto' }}>

              {/* Upload area */}
              {!results.length && !analyzing && (
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ebebf0', padding: 28, marginBottom: 20 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 16 }}>上传合同</p>

                  {/* File drop zone */}
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#111' }}
                    onDragLeave={e => e.currentTarget.style.borderColor = '#e0e0e8'}
                    onDrop={async e => {
                      e.preventDefault()
                      e.currentTarget.style.borderColor = '#e0e0e8'
                      const file = e.dataTransfer.files[0]
                      if (file) await handleFileUpload(file)
                    }}
                    style={{ border: '2px dashed #e0e0e8', borderRadius: 10, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 16, transition: 'border-color 0.15s' }}
                  >
                    <Upload size={20} style={{ color: '#ccc', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13, color: '#888', margin: 0 }}>拖拽 PDF / TXT 文件，或点击上传</p>
                    {contractName !== '合同文本' && contractText && (
                      <p style={{ fontSize: 12, color: '#16a34a', marginTop: 6 }}>已加载：{contractName}</p>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept=".txt,.pdf" style={{ display: 'none' }} onChange={async e => {
                    const file = e.target.files?.[0]
                    if (file) await handleFileUpload(file)
                  }} />

                  <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginBottom: 4 }}>
                    原文不存储，仅保存分析结果
                  </p>
                  <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginBottom: 12 }}>或直接粘贴合同文本</p>

                  <textarea
                    value={contractText}
                    onChange={e => setContractText(e.target.value)}
                    placeholder="将合同全文粘贴到此处..."
                    rows={8}
                    style={{ width: '100%', borderRadius: 10, border: '1px solid #e0e0e8', padding: '12px 14px', fontSize: 13, color: '#111', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fafafa' }}
                  />

                  {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 8 }}>{error}</p>}

                  <button
                    onClick={handleAnalyze}
                    disabled={!contractText.trim()}
                    style={{ marginTop: 16, width: '100%', height: 44, borderRadius: 10, border: 'none', background: contractText.trim() ? '#111' : '#e0e0e8', color: contractText.trim() ? '#fff' : '#aaa', fontSize: 14, fontWeight: 500, cursor: contractText.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <FileSearch size={15} />开始审查
                  </button>
                </div>
              )}

              {/* Analyzing state */}
              {analyzing && (
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ebebf0', padding: 32, marginBottom: 20, textAlign: 'center' }}>
                  <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: '#111', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 6 }}>正在分析合同...</p>
                  <p style={{ fontSize: 12, color: '#aaa', marginBottom: 16 }}>AI 正在逐项提取关键信息</p>
                  <div style={{ height: 4, background: '#f0f0f5', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#111', borderRadius: 2, width: `${progress}%`, transition: 'width 0.4s ease' }} />
                  </div>
                  <p style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>{progress}%</p>
                </div>
              )}

              {/* Results */}
              {results.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>审查结果</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => { setResults([]); setProgress(0); setError('') }}
                        style={{ height: 32, padding: '0 14px', borderRadius: 8, border: '1px solid #e0e0e8', background: '#fff', fontSize: 12, color: '#666', cursor: 'pointer' }}
                      >
                        重新审查
                      </button>
                      <button
                        onClick={() => setTab('chat')}
                        style={{ height: 32, padding: '0 14px', borderRadius: 8, border: 'none', background: '#111', fontSize: 12, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        <MessageSquare size={12} />AI 追问
                      </button>
                    </div>
                  </div>
                  <ReviewTable results={results} />
                  {analyzing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, color: '#aaa', fontSize: 12 }}>
                      <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
                      分析中...
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Chat tab ── */}
          {tab === 'chat' && (
            <div style={{ maxWidth: 760, margin: '0 auto', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
              <ReviewChat results={results} />
            </div>
          )}
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
