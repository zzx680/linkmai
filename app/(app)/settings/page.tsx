'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Scale, Zap,
  User, Shield, CreditCard, Bell, Check, Eye, EyeOff, Gift, Receipt, Loader2, Trash2, AlertTriangle
} from 'lucide-react'
import { TOP_UP_PACKS, formatBalance, ANNUAL_CARD_PRICE } from '@/lib/billing/config'
import Sidebar from '@/app/components/Sidebar'

type Tab = 'account' | 'security' | 'billing' | 'notifications'

interface Transaction {
  id: string
  amount: number
  balance_after: number
  description: string
  created_at: string
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('account')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [userCreatedAt, setUserCreatedAt] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState('')

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Billing state
  const [balance, setBalance] = useState<number | null>(null)
  const [hasCard, setHasCard] = useState(false)
  const [cardExpiresAt, setCardExpiresAt] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txLoading, setTxLoading] = useState(false)
  const [topupLoading, setTopupLoading] = useState<string | null>(null)
  const [cardLoading, setCardLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || '')
        setUserPhone(user.phone || '')
        setUserCreatedAt(user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '')
      }
    })
    loadBalance()
    loadCard()
  }, [])

  const loadBalance = async () => {
    const res = await fetch('/api/billing/balance')
    if (res.ok) setBalance((await res.json()).balance)
  }

  const loadCard = async () => {
    const res = await fetch('/api/billing/annual-card')
    if (res.ok) {
      const data = await res.json()
      setHasCard(data.active)
      setCardExpiresAt(data.expires_at)
    }
  }

  const loadTransactions = async () => {
    setTxLoading(true)
    const res = await fetch('/api/billing/transactions?limit=20')
    if (res.ok) {
      const data = await res.json()
      setTransactions(data.transactions || [])
    }
    setTxLoading(false)
  }

  const handleActivateCard = async () => {
    setCardLoading(true)
    try {
      const res = await fetch('/api/billing/annual-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        await loadCard()
        await loadTransactions()
      }
    } catch {}
    setCardLoading(false)
  }

  const handleTopUp = async (packId: string) => {
    setTopupLoading(packId)
    try {
      const res = await fetch('/api/billing/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      })
      const data = await res.json()
      if (res.ok) {
        setBalance(data.balance)
        loadTransactions()
      }
    } catch {}
    setTopupLoading(null)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwNew !== pwConfirm) { setPwError('两次输入的密码不一致'); return }
    if (pwNew.length < 6) { setPwError('密码至少 6 位'); return }
    setPwLoading(true); setPwError(''); setPwSuccess(false)
    const { error } = await supabase.auth.updateUser({ password: pwNew })
    if (error) { setPwError(error.message) }
    else { setPwSuccess(true); setPwNew(''); setPwConfirm('') }
    setPwLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) { setDeleteError('请输入密码确认'); return }
    setDeleteLoading(true); setDeleteError('')
    const res = await fetch('/api/account/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: deletePassword }),
    })
    const data = await res.json()
    if (!res.ok) { setDeleteError(data.error || '删除失败'); setDeleteLoading(false); return }
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const avatarLetter = userEmail ? userEmail[0].toUpperCase() : 'U'

  const TABS: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'account', icon: <User size={15} />, label: '账号信息' },
    { key: 'security', icon: <Shield size={15} />, label: '安全设置' },
    { key: 'billing', icon: <CreditCard size={15} />, label: '订阅与用量' },
    { key: 'notifications', icon: <Bell size={15} />, label: '通知偏好' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f6fa', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif" }}>

      <Sidebar />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 28px', background: '#fff', borderBottom: '1px solid #ebebf0', flexShrink: 0, gap: 6 }}>
          <Scale size={15} style={{ color: '#aaa' }} />
          <span style={{ fontSize: 13, color: '#aaa' }}>账户</span>
          <span style={{ fontSize: 13, color: '#ccc', margin: '0 2px' }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>设置</span>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 24 }}>

            {/* Left tab nav */}
            <div style={{ width: 168, flexShrink: 0 }}>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
                {TABS.map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                      padding: '11px 14px', border: 'none', cursor: 'pointer', fontSize: 13,
                      fontWeight: tab === t.key ? 600 : 400,
                      color: tab === t.key ? '#111' : '#888',
                      background: tab === t.key ? '#f5f5f8' : '#fff',
                      borderBottom: '1px solid #f5f5f8',
                      textAlign: 'left' as const,
                    }}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right content */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Account info */}
              {tab === 'account' && (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0f5' }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>账号信息</h2>
                  </div>
                  <div style={{ padding: '24px' }}>
                    {/* Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #f5f5f8' }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{avatarLetter}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 3 }}>{userEmail || '—'}</p>
                        <p style={{ fontSize: 12, color: '#aaa' }}>注册于 {userCreatedAt || '—'}</p>
                      </div>
                    </div>

                    {/* Fields */}
                    {[
                      { label: '邮箱地址', value: userEmail || '未绑定', action: '修改' },
                      { label: '手机号码', value: userPhone || '未绑定', action: userPhone ? '修改' : '绑定' },
                    ].map(field => (
                      <div key={field.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f5f5f8' }}>
                        <div>
                          <p style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>{field.label}</p>
                          <p style={{ fontSize: 14, color: '#333' }}>{field.value}</p>
                        </div>
                        <button style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 6 }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                          {field.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security */}
              {tab === 'security' && (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0f5' }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>安全设置</h2>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 16 }}>修改密码</p>
                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {[
                        { label: '新密码', value: pwNew, setter: setPwNew, placeholder: '至少 6 位' },
                        { label: '确认新密码', value: pwConfirm, setter: setPwConfirm, placeholder: '再次输入新密码' },
                      ].map(field => (
                        <div key={field.label}>
                          <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>{field.label}</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type={showPw ? 'text' : 'password'}
                              value={field.value}
                              onChange={e => field.setter(e.target.value)}
                              required
                              placeholder={field.placeholder}
                              style={{ width: '100%', paddingRight: 44, height: 42, boxSizing: 'border-box' as const, borderRadius: 8, border: 'none', background: '#f0f2f5', padding: '0 44px 0 14px', fontSize: 14, color: '#111', outline: 'none' }}
                            />
                            {field.label === '新密码' && (
                              <button type="button" onClick={() => setShowPw(!showPw)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 2 }}>
                                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {pwError && (
                        <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#dc2626' }}>
                          {pwError}
                        </div>
                      )}
                      {pwSuccess && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 13, color: '#16a34a' }}>
                          <Check size={14} />密码已更新
                        </div>
                      )}

                      <button type="submit" disabled={pwLoading}
                        style={{ height: 40, padding: '0 20px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 500, cursor: pwLoading ? 'default' : 'pointer', opacity: pwLoading ? 0.6 : 1, alignSelf: 'flex-start' }}>
                        {pwLoading ? '更新中...' : '更新密码'}
                      </button>
                    </form>

                    {/* Delete account */}
                    <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f5' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>删除账号</p>
                      <p style={{ fontSize: 12, color: '#aaa', marginBottom: 16 }}>删除后，您的所有案件、文书、材料及交易记录将被永久清除，不可恢复。</p>
                      <button onClick={() => { setShowDeleteModal(true); setDeletePassword(''); setDeleteError('') }}
                        style={{ height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Trash2 size={13} />删除我的账号
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete account modal */}
              {showDeleteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                  <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.15)', padding: '28px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <AlertTriangle size={16} style={{ color: '#dc2626' }} />
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>确认删除账号</h3>
                    </div>
                    <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, marginBottom: 20 }}>
                      此操作<strong>不可撤销</strong>。您的所有案件、文书、材料、交易记录将被永久删除。请输入密码确认。
                    </p>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={e => setDeletePassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleDeleteAccount()}
                      placeholder="输入当前密码"
                      autoFocus
                      style={{ width: '100%', height: 42, borderRadius: 8, border: '1px solid #e0e0e8', background: '#f9f9fb', padding: '0 14px', fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                    />
                    {deleteError && (
                      <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>{deleteError}</p>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setShowDeleteModal(false)}
                        style={{ flex: 1, height: 40, borderRadius: 8, border: '1px solid #e0e0e8', background: '#fff', color: '#555', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                        取消
                      </button>
                      <button onClick={handleDeleteAccount} disabled={deleteLoading}
                        style={{ flex: 1, height: 40, borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 500, cursor: deleteLoading ? 'not-allowed' : 'pointer', opacity: deleteLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {deleteLoading ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />删除中...</> : '永久删除'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing */}
              {tab === 'billing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Balance card */}
                  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0f5' }}>
                      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>账户余额</h2>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', marginBottom: 20 }}>
                        <div>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>当前余额</p>
                          <p style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                            {balance !== null ? formatBalance(balance) : '—'}
                          </p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                            文书起草 {hasCard ? '¥9/份（年卡价）' : '¥19/份'}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {hasCard ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 600, background: '#2563eb', color: '#fff', padding: '3px 10px', borderRadius: 20 }}>年卡会员</span>
                              {cardExpiresAt && (
                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                                  {new Date(cardExpiresAt).toLocaleDateString('zh-CN')} 到期
                                </span>
                              )}
                            </div>
                          ) : (
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CreditCard size={22} style={{ color: '#fff' }} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Top-up */}
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 12 }}>充值余额</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
                        {TOP_UP_PACKS.map(pack => (
                          <button key={pack.id} onClick={() => handleTopUp(pack.id)} disabled={topupLoading !== null}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center',
                              padding: '12px 8px', borderRadius: 10, border: '1px solid #ebebf0',
                              background: '#fff', cursor: topupLoading ? 'wait' : 'pointer', transition: 'border-color 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#111'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#ebebf0'}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>¥{pack.amount / 100}</span>
                            <span style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>约 {Math.floor(pack.totalCredits / (hasCard ? 900 : 1900))} 份</span>
                            {topupLoading === pack.id && <Loader2 size={11} style={{ marginTop: 3, animation: 'spin 0.8s linear infinite', color: '#2563eb' }} />}
                          </button>
                        ))}
                      </div>

                      {/* Annual card upsell — only show if no active card */}
                      {!hasCard && (
                        <div style={{ padding: '16px 18px', borderRadius: 10, background: '#f8f8fb', border: '1px solid #e8e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 3 }}>开通年卡，每份文书只需 ¥9</p>
                            <p style={{ fontSize: 12, color: '#888' }}>¥1,280/年 · 每月起草 9 份即回本 · 所有功能 5 折</p>
                          </div>
                          <button onClick={handleActivateCard} disabled={cardLoading}
                            style={{ flexShrink: 0, height: 36, padding: '0 16px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 13, fontWeight: 500, cursor: cardLoading ? 'wait' : 'pointer', marginLeft: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {cardLoading ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Zap size={13} />}
                            开通年卡
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transactions */}
                  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>消费记录</h2>
                      <button onClick={loadTransactions} disabled={txLoading}
                        style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        {txLoading ? '加载中...' : '查看记录'}
                      </button>
                    </div>
                    {transactions.length === 0 ? (
                      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                        <Receipt size={18} style={{ color: '#ccc', marginBottom: 8 }} />
                        <p style={{ fontSize: 13, color: '#aaa' }}>暂无消费记录</p>
                        <p style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>使用 AI 功能后，扣费记录会显示在这里</p>
                      </div>
                    ) : (
                      <div>
                        {transactions.map((tx, i) => (
                          <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: i < transactions.length - 1 ? '1px solid #f5f5f8' : 'none' }}>
                            <div>
                              <p style={{ fontSize: 13, color: '#333', marginBottom: 2 }}>{tx.description}</p>
                              <p style={{ fontSize: 11, color: '#aaa' }}>{new Date(tx.created_at).toLocaleString('zh-CN')}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: 14, fontWeight: 600, color: tx.amount > 0 ? '#16a34a' : '#dc2626' }}>
                                {tx.amount > 0 ? '+' : ''}{formatBalance(tx.amount)}
                              </p>
                              <p style={{ fontSize: 11, color: '#aaa' }}>余额 {formatBalance(tx.balance_after)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notifications — placeholder */}
              {tab === 'notifications' && (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', overflow: 'hidden' }}>
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0f5' }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>通知偏好</h2>
                  </div>
                  <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f5f5f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <Bell size={18} style={{ color: '#ccc' }} />
                    </div>
                    <p style={{ fontSize: 14, color: '#aaa', marginBottom: 4 }}>即将推出</p>
                    <p style={{ fontSize: 12, color: '#bbb' }}>邮件和短信通知设置正在开发中</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
