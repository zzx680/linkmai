'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, RefreshCw, LogOut, Users, Key, Loader2, MessageSquare } from 'lucide-react'

type InviteCode = {
  code: string
  used: boolean
  used_by: string | null
  used_by_email: string | null
  used_at: string | null
  note: string | null
  created_at: string
}

type UserRow = {
  id: string
  email: string
  created_at: string
  balance: number
  annual_card_expires_at: string | null
  is_admin: boolean
}

export default function AdminPage() {
  const [tab, setTab] = useState<'codes' | 'users' | 'contact'>('codes')
  const [adminEmail, setAdminEmail] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Auth check on mount
  useEffect(() => {
    fetch('/api/admin/auth/check')
      .then(r => r.json())
      .then(d => {
        if (d.ok) { setAdminEmail(d.email); setAuthChecked(true) }
        else router.replace('/admin/login')
      })
      .catch(() => router.replace('/admin/login'))
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
        <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite', color: '#aaa' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif" }}>

      {/* Header */}
      <header style={{ height: 56, background: '#fff', borderBottom: '1px solid #ebebf0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <img src="/logo.png" alt="Linkmai" style={{ width: 24, height: 24, filter: 'brightness(0) drop-shadow(0 0 0.5px #000) drop-shadow(0 0 0.5px #000)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>管理后台</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#aaa' }}>{adminEmail}</span>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid #e0e0e8', background: '#fff', color: '#666', fontSize: 12, cursor: 'pointer' }}>
            <LogOut size={13} />退出
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#fff', borderRadius: 10, padding: 4, border: '1px solid #ebebf0', width: 'fit-content' }}>
          {([['codes', Key, '邀请码管理'], ['users', Users, '用户列表'], ['contact', MessageSquare, '联系管理']] as const).map(([key, Icon, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 34, padding: '0 16px', borderRadius: 8, border: 'none',
              background: tab === key ? '#111' : 'transparent',
              color: tab === key ? '#fff' : '#888',
              fontSize: 13, fontWeight: tab === key ? 600 : 400, cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {tab === 'codes' && <CodesTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'contact' && <ContactTab />}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ─── Invite Codes Tab ─────────────────────────────────────────────────────────

function CodesTab() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingCode, setDeletingCode] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/admin/invite-codes')
    if (r.ok) setCodes(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    setCreating(true)
    const r = await fetch('/api/admin/invite-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    if (r.ok) { setNote(''); await load() }
    setCreating(false)
  }

  const handleDelete = async (code: string) => {
    setDeletingCode(code)
    await fetch('/api/admin/invite-codes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    await load()
    setDeletingCode(null)
  }

  const total = codes.length
  const used = codes.filter(c => c.used).length
  const available = total - used

  const formatTime = (ts: string) => new Date(ts).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[['总数', total, '#111'], ['已使用', used, '#dc2626'], ['可用', available, '#16a34a']].map(([label, val, color]) => (
          <div key={label as string} style={{ background: '#fff', borderRadius: 10, border: '1px solid #ebebf0', padding: '16px 20px' }}>
            <p style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: color as string }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Create */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          placeholder="备注（可选，如：张律师）"
          style={{ flex: 1, height: 38, borderRadius: 8, border: '1px solid #e0e0e8', padding: '0 12px', fontSize: 13, color: '#111', outline: 'none', background: '#fafafa' }}
        />
        <button
          onClick={handleCreate}
          disabled={creating}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
        >
          {creating ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={13} />}
          生成邀请码
        </button>
        <button onClick={load} style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid #e0e0e8', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
            <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite', color: '#aaa' }} />
          </div>
        ) : codes.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 48, color: '#aaa', fontSize: 13 }}>暂无邀请码</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f5' }}>
                {['邀请码', '备注', '状态', '使用者', '使用时间', '创建时间', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#aaa' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map((c, i) => (
                <tr key={c.code} style={{ borderBottom: i < codes.length - 1 ? '1px solid #f5f5f8' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <code style={{ fontSize: 13, fontWeight: 600, color: '#111', background: '#f5f5f8', padding: '2px 8px', borderRadius: 6, letterSpacing: '0.05em' }}>{c.code}</code>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>{c.note || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: c.used ? '#fef2f2' : '#f0fdf4', color: c.used ? '#dc2626' : '#16a34a' }}>
                      {c.used ? '已使用' : '可用'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#888' }}>{c.used_by_email || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#aaa' }}>{c.used_at ? formatTime(c.used_at) : '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#aaa' }}>{formatTime(c.created_at)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {!c.used && (
                      <button
                        onClick={() => handleDelete(c.code)}
                        disabled={deletingCode === c.code}
                        style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: '#fff5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}
                      >
                        {deletingCode === c.code ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={13} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setUsers(d) })
      .finally(() => setLoading(false))
  }, [])

  const formatBalance = (cents: number) => `¥${(cents / 100).toFixed(2)}`
  const formatDate = (ts: string) => new Date(ts).toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })

  const hasCard = (u: UserRow) => u.annual_card_expires_at && new Date(u.annual_card_expires_at) > new Date()

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
            <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite', color: '#aaa' }} />
          </div>
        ) : users.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 48, color: '#aaa', fontSize: 13 }}>暂无用户</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f5' }}>
                {['邮箱', '注册时间', '余额', '年卡状态', '身份'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#aaa' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #f5f5f8' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#111', fontWeight: 500 }}>{u.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#888' }}>{formatDate(u.created_at)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: u.balance > 0 ? '#111' : '#aaa' }}>{formatBalance(u.balance)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: hasCard(u) ? '#eff6ff' : '#f5f5f8', color: hasCard(u) ? '#2563eb' : '#aaa' }}>
                      {hasCard(u) ? '年卡有效' : '无年卡'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {u.is_admin && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: '#111', color: '#fff' }}>管理员</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p style={{ fontSize: 12, color: '#aaa', marginTop: 12 }}>共 {users.length} 位用户</p>
    </div>
  )
}

// ─── Contact Tab ─────────────────────────────────────────────────────────────

type ContactRow = {
  id: string
  name: string
  contact: string
  firm: string | null
  message: string
  status: 'pending' | 'replied' | 'closed'
  replied_at: string | null
  reply_note: string | null
  created_at: string
}

function ContactTab() {
  const [rows, setRows] = useState<ContactRow[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replyNote, setReplyNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/admin/contact')
    if (r.ok) setRows(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleReply = async (id: string) => {
    setSaving(true)
    await fetch('/api/admin/contact', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'replied', reply_note: replyNote }),
    })
    setReplyNote('')
    setExpandedId(null)
    await load()
    setSaving(false)
  }

  const handleClose = async (id: string) => {
    await fetch('/api/admin/contact', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'closed' }),
    })
    await load()
  }

  const pending = rows.filter(r => r.status === 'pending').length
  const replied = rows.filter(r => r.status === 'replied').length

  const formatTime = (ts: string) => new Date(ts).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[['总计', rows.length, '#111'], ['待处理', pending, '#d97706'], ['已回复', replied, '#16a34a']].map(([label, val, color]) => (
          <div key={label as string} style={{ background: '#fff', borderRadius: 10, border: '1px solid #ebebf0', padding: '16px 20px' }}>
            <p style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: color as string }}>{val}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
            <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite', color: '#aaa' }} />
          </div>
        ) : rows.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 48, color: '#aaa', fontSize: 13 }}>暂无联系记录</p>
        ) : (
          rows.map((r, i) => (
            <div key={r.id}>
              <div
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: i < rows.length - 1 ? '1px solid #f5f5f8' : 'none', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: r.status === 'pending' ? '#fef3c7' : r.status === 'replied' ? '#f0fdf4' : '#f5f5f8', color: r.status === 'pending' ? '#d97706' : r.status === 'replied' ? '#16a34a' : '#aaa' }}>
                  {r.status === 'pending' ? '待处理' : r.status === 'replied' ? '已回复' : '已关闭'}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{r.name}</span>
                <span style={{ fontSize: 12, color: '#888' }}>{r.contact}</span>
                {r.firm && <span style={{ fontSize: 11, color: '#aaa', background: '#f5f5f8', padding: '2px 6px', borderRadius: 4 }}>{r.firm}</span>}
                <span style={{ fontSize: 12, color: '#aaa', flex: 1 }}>{r.message.slice(0, 40)}{r.message.length > 40 ? '...' : ''}</span>
                <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0 }}>{formatTime(r.created_at)}</span>
              </div>
              {expandedId === r.id && (
                <div style={{ padding: '16px 20px', background: '#fafafa', borderBottom: i < rows.length - 1 ? '1px solid #f5f5f8' : 'none' }}>
                  <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, marginBottom: r.reply_note ? 12 : 0 }}>{r.message}</p>
                  {r.reply_note && (
                    <div style={{ background: '#fff', borderRadius: 8, padding: '12px 14px', marginBottom: 12, border: '1px solid #e0e0e8' }}>
                      <p style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>回复</p>
                      <p style={{ fontSize: 13, color: '#111', lineHeight: 1.7 }}>{r.reply_note}</p>
                    </div>
                  )}
                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <textarea
                        value={replyNote}
                        onChange={e => setReplyNote(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        placeholder="回复内容..."
                        rows={3}
                        style={{ flex: 1, borderRadius: 8, border: '1px solid #e0e0e8', padding: '10px 12px', fontSize: 13, color: '#111', resize: 'none', outline: 'none', background: '#fff', fontFamily: 'inherit' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReply(r.id) }}
                          disabled={saving || !replyNote.trim()}
                          style={{ height: 34, padding: '0 16px', borderRadius: 8, border: 'none', background: replyNote.trim() ? '#111' : '#e0e0e8', color: replyNote.trim() ? '#fff' : '#aaa', fontSize: 13, cursor: replyNote.trim() ? 'pointer' : 'not-allowed' }}
                        >
                          回复
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleClose(r.id) }}
                          style={{ height: 34, padding: '0 16px', borderRadius: 8, border: '1px solid #e0e0e8', background: '#fff', color: '#888', fontSize: 13, cursor: 'pointer' }}
                        >
                          关闭
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
