'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EditSuggestion } from '@/lib/types'
import { Wand2, Send, Loader2, Check, X, CheckCheck } from 'lucide-react'

interface Props {
  docId: string
  initialContent: string
}

type Decision = 'pending' | 'accepted' | 'rejected'

export default function EditPanel({ docId, initialContent }: Props) {
  const router = useRouter()
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading] = useState(false)
  const [edits, setEdits] = useState<EditSuggestion[]>([])
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSuggest = async () => {
    if (!instruction.trim() || loading) return
    setLoading(true)
    setEdits([])
    setDecisions([])
    setError('')
    try {
      const res = await fetch(`/api/documents/${docId}/suggest-edits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: instruction.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '请求失败')
      if (data.edits.length === 0) {
        setError('未找到可修改的内容，请尝试更具体的指令')
      } else {
        setEdits(data.edits)
        setDecisions(data.edits.map(() => 'pending' as Decision))
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const handleDecide = (index: number, decision: 'accepted' | 'rejected') => {
    setDecisions(prev => prev.map((d, i) => i === index ? decision : d))
  }

  const handleAcceptAll = () => {
    setDecisions(prev => prev.map(() => 'accepted'))
  }

  const applyEdits = (content: string, accepted: EditSuggestion[]): string => {
    // Apply in reverse order to avoid position shifts
    let result = content
    for (const edit of [...accepted].reverse()) {
      const idx = result.indexOf(edit.find)
      if (idx !== -1) {
        result = result.slice(0, idx) + edit.replace + result.slice(idx + edit.find.length)
      }
    }
    return result
  }

  const handleSave = async () => {
    const accepted = edits.filter((_, i) => decisions[i] === 'accepted')
    if (accepted.length === 0) return
    setSaving(true)
    try {
      const newContent = applyEdits(initialContent, accepted)
      const res = await fetch(`/api/documents/${docId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent, source: 'human', changeNote: `AI 辅助修改：${instruction}` }),
      })
      if (res.ok) {
        setEdits([])
        setDecisions([])
        setInstruction('')
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  const acceptedCount = decisions.filter(d => d === 'accepted').length
  const pendingCount = decisions.filter(d => d === 'pending').length

  return (
    <div style={{ width: 340, display: 'flex', flexDirection: 'column', background: '#fff', borderLeft: '1px solid #ebebf0', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderBottom: '1px solid #ebebf0', flexShrink: 0 }}>
        <Wand2 size={15} style={{ color: '#2563eb' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>AI 修改助手</span>
      </div>

      {/* Input */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f5', flexShrink: 0 }}>
        <textarea
          value={instruction}
          onChange={e => setInstruction(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSuggest() } }}
          placeholder="描述修改内容，如：把第三条诉讼请求金额改为 50000 元..."
          rows={3}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e0e0e8', background: '#fafafa', fontSize: 12, color: '#111', outline: 'none', resize: 'none', lineHeight: 1.6 }}
        />
        <button onClick={handleSuggest} disabled={loading || !instruction.trim()}
          style={{ marginTop: 8, width: '100%', height: 34, borderRadius: 8, border: 'none', background: loading || !instruction.trim() ? '#e0e0e8' : '#111', color: loading || !instruction.trim() ? '#aaa' : '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {loading ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={13} />}
          {loading ? '分析中...' : '生成修改建议'}
        </button>
      </div>

      {/* Suggestions */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
        {error && (
          <div style={{ padding: '10px 12px', borderRadius: 8, background: '#fff0f0', border: '1px solid #ffd0d0', fontSize: 12, color: '#dc2626', marginBottom: 10 }}>
            {error}
          </div>
        )}

        {edits.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#888' }}>{edits.length} 条建议 · {acceptedCount} 已接受</span>
              {pendingCount > 0 && (
                <button onClick={handleAcceptAll}
                  style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCheck size={12} />全部接受
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {edits.map((edit, i) => (
                <EditCard
                  key={i}
                  edit={edit}
                  decision={decisions[i]}
                  onAccept={() => handleDecide(i, 'accepted')}
                  onReject={() => handleDecide(i, 'rejected')}
                />
              ))}
            </div>

            {acceptedCount > 0 && (
              <button onClick={handleSave} disabled={saving}
                style={{ marginTop: 14, width: '100%', height: 36, borderRadius: 8, border: 'none', background: saving ? '#e0e0e8' : '#16a34a', color: saving ? '#aaa' : '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {saving ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={13} />}
                {saving ? '保存中...' : `保存 ${acceptedCount} 条修改`}
              </button>
            )}
          </>
        )}

        {!loading && edits.length === 0 && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160, gap: 8 }}>
            <Wand2 size={28} style={{ color: '#e0e0e8' }} />
            <p style={{ fontSize: 12, color: '#bbb', textAlign: 'center' }}>输入修改指令，AI 会定位原文并提出精确修改建议</p>
          </div>
        )}
      </div>
    </div>
  )
}

function EditCard({ edit, decision, onAccept, onReject }: {
  edit: EditSuggestion
  decision: Decision
  onAccept: () => void
  onReject: () => void
}) {
  const borderColor = decision === 'accepted' ? '#bbf7d0' : decision === 'rejected' ? '#fecaca' : '#ebebf0'
  const bg = decision === 'accepted' ? '#f0fdf4' : decision === 'rejected' ? '#fff5f5' : '#fff'

  return (
    <div style={{ borderRadius: 8, border: `1px solid ${borderColor}`, background: bg, overflow: 'hidden', transition: 'all 0.15s' }}>
      <div style={{ padding: '10px 12px' }}>
        {/* Diff view */}
        <div style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>
          <div style={{ padding: '4px 8px', borderRadius: 5, background: '#fff0f0', color: '#dc2626', textDecoration: 'line-through', marginBottom: 4, wordBreak: 'break-all' as const }}>
            {edit.find}
          </div>
          <div style={{ padding: '4px 8px', borderRadius: 5, background: '#f0fdf4', color: '#16a34a', wordBreak: 'break-all' as const }}>
            {edit.replace}
          </div>
        </div>
        {/* Reason */}
        {edit.reason && (
          <p style={{ fontSize: 11, color: '#888', margin: '0 0 8px', lineHeight: 1.5 }}>{edit.reason}</p>
        )}
        {/* Actions */}
        {decision === 'pending' && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onAccept}
              style={{ flex: 1, height: 28, borderRadius: 6, border: 'none', background: '#f0fdf4', color: '#16a34a', fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Check size={11} />接受
            </button>
            <button onClick={onReject}
              style={{ flex: 1, height: 28, borderRadius: 6, border: 'none', background: '#fff0f0', color: '#dc2626', fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <X size={11} />拒绝
            </button>
          </div>
        )}
        {decision !== 'pending' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, color: decision === 'accepted' ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
              {decision === 'accepted' ? '✓ 已接受' : '✗ 已拒绝'}
            </span>
            <button onClick={() => decision === 'accepted' ? onReject() : onAccept()}
              style={{ fontSize: 11, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}>
              撤销
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
