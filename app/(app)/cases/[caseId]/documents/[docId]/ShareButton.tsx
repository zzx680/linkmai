'use client'

import { useState } from 'react'
import { Share2, Check, X } from 'lucide-react'

interface Props {
  docId: string
  initialShareEnabled?: boolean
  initialShareToken?: string | null
}

export default function ShareButton({ docId, initialShareEnabled, initialShareToken }: Props) {
  const [shareEnabled, setShareEnabled] = useState(initialShareEnabled ?? false)
  const [shareToken, setShareToken] = useState(initialShareToken ?? null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  const shareUrl = shareToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareToken}` : ''

  const handleEnable = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/documents/${docId}/share`, { method: 'POST' })
      const data = await res.json()
      setShareToken(data.token)
      setShareEnabled(true)
      setShowPanel(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    try {
      await fetch(`/api/documents/${docId}/share`, { method: 'DELETE' })
      setShareEnabled(false)
      setShareToken(null)
      setShowPanel(false)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!shareToken) return
    const url = `${window.location.origin}/share/${shareToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={shareEnabled ? () => setShowPanel(v => !v) : handleEnable}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          height: 30, padding: '0 12px', borderRadius: 7,
          border: shareEnabled ? '1px solid #d0d8ff' : '1px solid var(--border-subtle)',
          background: shareEnabled ? '#f0f4ff' : 'var(--bg-surface)',
          color: shareEnabled ? '#2563eb' : 'var(--text-secondary)',
          fontSize: 12, cursor: loading ? 'wait' : 'pointer',
        }}>
        <Share2 style={{ width: 12, height: 12 }} />
        {loading ? '处理中...' : shareEnabled ? '已分享' : '分享'}
      </button>

      {showPanel && shareEnabled && (
        <div style={{
          position: 'absolute', top: 36, right: 0, zIndex: 50,
          width: 320, background: '#fff', borderRadius: 10,
          border: '1px solid #ebebf0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>分享链接</span>
            <button onClick={() => setShowPanel(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#aaa', padding: 2 }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              readOnly
              value={shareUrl}
              style={{ flex: 1, height: 34, padding: '0 10px', borderRadius: 7, border: '1px solid #e0e0e8', background: '#fafafa', fontSize: 12, color: '#555', outline: 'none' }}
            />
            <button onClick={handleCopy}
              style={{ height: 34, padding: '0 14px', borderRadius: 7, border: 'none', background: copied ? '#16a34a' : '#111', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              {copied ? <><Check style={{ width: 12, height: 12 }} />已复制</> : '复制'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#aaa', marginBottom: 12 }}>任何拥有此链接的人均可查看，无需登录</p>
          <button onClick={handleDisable} disabled={loading}
            style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            撤销分享
          </button>
        </div>
      )}
    </div>
  )
}
