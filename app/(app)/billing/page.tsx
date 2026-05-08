'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Scale, CreditCard, TrendingDown, TrendingUp, Zap, Receipt, Loader2, Gift, Check } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'
import { TOP_UP_PACKS, formatBalance, ANNUAL_CARD_PRICE, PRICES } from '@/lib/billing/config'

interface Transaction {
  id: string
  amount: number
  balance_after: number
  description: string
  metadata: Record<string, unknown>
  created_at: string
}

type BillingTab = 'overview' | 'topup' | 'records'

export default function BillingPage() {
  const [tab, setTab] = useState<BillingTab>('overview')
  const [balance, setBalance] = useState<number | null>(null)
  const [hasCard, setHasCard] = useState(false)
  const [cardExpiresAt, setCardExpiresAt] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txLoading, setTxLoading] = useState(false)
  const [topupLoading, setTopupLoading] = useState<string | null>(null)
  const [cardLoading, setCardLoading] = useState(false)
  const [userName, setUserName] = useState('')

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '')
    })
    loadBalance()
    loadCard()
    loadTransactions()
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
    const res = await fetch('/api/billing/transactions?limit=50')
    if (res.ok) setTransactions((await res.json()).transactions || [])
    setTxLoading(false)
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
        await loadTransactions()
        setTab('records')
      }
    } catch {}
    setTopupLoading(null)
  }

  const handleActivateCard = async () => {
    setCardLoading(true)
    try {
      const res = await fetch('/api/billing/annual-card', { method: 'POST' })
      if (res.ok) { await loadCard(); await loadTransactions() }
    } catch {}
    setCardLoading(false)
  }

  // Stats from transactions
  const totalSpent = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const totalTopup = transactions.filter(t => t.amount > 0 && t.metadata?.type !== 'annual_card').reduce((s, t) => s + t.amount, 0)
  const draftCount = transactions.filter(t => t.metadata?.action === 'draft').length
  const searchCount = transactions.filter(t => t.metadata?.action === 'search').length

  const TABS = [
    { key: 'overview' as const, label: '账户总览' },
    { key: 'topup'    as const, label: '账户充值' },
    { key: 'records'  as const, label: '充值明细' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f6fa', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 28px', background: '#fff', borderBottom: '1px solid #ebebf0', flexShrink: 0, gap: 6 }}>
          <Scale size={15} style={{ color: '#aaa' }} />
          <span style={{ fontSize: 13, color: '#aaa' }}>账户</span>
          <span style={{ fontSize: 13, color: '#ccc', margin: '0 2px' }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>账户管理</span>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid #e8e8f0', marginBottom: 28 }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  padding: '10px 20px', fontSize: 14, fontWeight: tab === t.key ? 600 : 400,
                  color: tab === t.key ? '#111' : '#888',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: tab === t.key ? '2px solid #111' : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.15s',
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── 账户总览 ── */}
            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Balance hero */}
                <div style={{ borderRadius: 16, background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a35 50%, #0f1a2e 100%)', padding: '32px 36px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(37,99,235,0.08)' }} />
                  <div style={{ position: 'absolute', bottom: -40, left: 100, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>账户余额</p>
                      <p style={{ fontSize: 48, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {balance !== null ? formatBalance(balance) : '—'}
                      </p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10 }}>
                        当前计费：文书起草 {hasCard ? '¥9/份（年卡）' : '¥19/份'} · 法律检索 {hasCard ? '¥1.5/次（年卡）' : '¥3/次'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                      {hasCard ? (
                        <div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(37,99,235,0.3)', border: '1px solid rgba(37,99,235,0.5)', borderRadius: 20, padding: '5px 12px' }}>
                            <Zap size={12} style={{ color: '#60a5fa' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#93c5fd' }}>年卡会员</span>
                          </div>
                          {cardExpiresAt && (
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 6, textAlign: 'right' }}>
                              {new Date(cardExpiresAt).toLocaleDateString('zh-CN')} 到期
                            </p>
                          )}
                        </div>
                      ) : (
                        <button onClick={() => setTab('topup')} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          height: 38, padding: '0 18px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
                          color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                        }}>
                          <CreditCard size={13} />立即充值
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                  {[
                    { label: '累计消费', value: formatBalance(totalSpent), icon: TrendingDown, color: '#dc2626', bg: '#fef2f2' },
                    { label: '累计充值', value: formatBalance(totalTopup), icon: TrendingUp, color: '#16a34a', bg: '#f0fdf4' },
                    { label: '文书起草', value: `${draftCount} 份`, icon: Receipt, color: '#2563eb', bg: '#eff6ff' },
                    { label: '法律检索', value: `${searchCount} 次`, icon: Zap, color: '#7c3aed', bg: '#f5f3ff' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <p style={{ fontSize: 12, color: '#888' }}>{s.label}</p>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <s.icon size={15} style={{ color: s.color }} />
                        </div>
                      </div>
                      <p style={{ fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Annual card upsell */}
                {!hasCard && (
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ebebf0', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>开通年卡，所有功能 5 折</p>
                        <span style={{ fontSize: 11, fontWeight: 600, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 20 }}>¥1,280/年</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#888' }}>文书起草 ¥9/份 · 法律检索 ¥1.5/次 · 每月起草 9 份即回本</p>
                    </div>
                    <button onClick={handleActivateCard} disabled={cardLoading} style={{
                      flexShrink: 0, height: 40, padding: '0 22px', borderRadius: 10,
                      border: 'none', background: '#111', color: '#fff',
                      fontSize: 13, fontWeight: 600, cursor: cardLoading ? 'wait' : 'pointer',
                      marginLeft: 24, display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {cardLoading ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Zap size={13} />}
                      开通年卡
                    </button>
                  </div>
                )}

                {/* Recent transactions */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ebebf0', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>最近消费</p>
                    <button onClick={() => setTab('records')} style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      查看全部
                    </button>
                  </div>
                  {txLoading ? (
                    <div style={{ padding: '32px', textAlign: 'center' }}>
                      <Loader2 size={18} style={{ color: '#ccc', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                      <p style={{ fontSize: 13, color: '#aaa' }}>暂无消费记录</p>
                      <p style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>使用 AI 功能后记录会显示在这里</p>
                    </div>
                  ) : (
                    transactions.slice(0, 5).map((tx, i) => (
                      <TxRow key={tx.id} tx={tx} last={i === Math.min(4, transactions.length - 1)} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── 账户充值 ── */}
            {tab === 'topup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Current balance */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ebebf0', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>当前余额</p>
                    <p style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>
                      {balance !== null ? formatBalance(balance) : '—'}
                    </p>
                  </div>
                  {hasCard && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, padding: '6px 14px' }}>
                      <Zap size={13} style={{ color: '#2563eb' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>年卡会员 · 5折计费</span>
                    </div>
                  )}
                </div>

                {/* Top-up packs */}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 14 }}>选择充值金额</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {TOP_UP_PACKS.map(pack => {
                      const drafts = Math.floor(pack.totalCredits / (hasCard ? PRICES.DRAFT_CARD : PRICES.DRAFT_PAYG))
                      const loading = topupLoading === pack.id
                      return (
                        <button key={pack.id} onClick={() => handleTopUp(pack.id)} disabled={topupLoading !== null}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '20px 24px', borderRadius: 12,
                            border: '1.5px solid #ebebf0', background: '#fff',
                            cursor: topupLoading ? 'wait' : 'pointer', textAlign: 'left' as const,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.background = '#fafafa' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#ebebf0'; e.currentTarget.style.background = '#fff' }}>
                          <div>
                            <p style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>{pack.label}</p>
                            <p style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>¥{pack.amount / 100}</p>
                            <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>约可起草 {drafts} 份文书</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            {loading
                              ? <Loader2 size={20} style={{ color: '#2563eb', animation: 'spin 0.8s linear infinite' }} />
                              : <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f5f5f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <CreditCard size={18} style={{ color: '#888' }} />
                                </div>
                            }
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Annual card */}
                {!hasCard && (
                  <div style={{ background: '#111', borderRadius: 14, padding: '28px 28px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>年卡会员</p>
                          <span style={{ fontSize: 11, fontWeight: 600, background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: 20 }}>5 折</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                          文书起草 ¥9/份 · 法律检索 ¥1.5/次 · 每月起草 9 份即回本
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {['所有 AI 功能享 5 折优惠', '余额永不过期', '年卡到期后自动恢复原价'].map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Check size={13} style={{ color: '#4ade80', flexShrink: 0 }} />
                              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, marginLeft: 32, textAlign: 'right' }}>
                        <p style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>¥1,280</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>/ 年（月均 ¥107）</p>
                        <button onClick={handleActivateCard} disabled={cardLoading} style={{
                          height: 42, padding: '0 24px', borderRadius: 10,
                          background: '#fff', color: '#111', border: 'none',
                          fontSize: 14, fontWeight: 600, cursor: cardLoading ? 'wait' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          {cardLoading ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Zap size={14} />}
                          立即开通
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {hasCard && (
                  <div style={{ background: '#f0fdf4', borderRadius: 14, border: '1px solid #bbf7d0', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={18} style={{ color: '#16a34a' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#15803d' }}>年卡已激活</p>
                      <p style={{ fontSize: 12, color: '#16a34a' }}>
                        所有 AI 功能享 5 折 · {cardExpiresAt ? `${new Date(cardExpiresAt).toLocaleDateString('zh-CN')} 到期` : ''}
                      </p>
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 12, color: '#bbb', textAlign: 'center' }}>
                  支持微信支付 · 支付宝 · 余额永不过期 · 律所对公转账请联系客服
                </p>
              </div>
            )}

            {/* ── 充值明细 ── */}
            {tab === 'records' && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ebebf0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>全部记录</p>
                  <p style={{ fontSize: 12, color: '#aaa' }}>共 {transactions.length} 条</p>
                </div>

                {txLoading ? (
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <Loader2 size={20} style={{ color: '#ccc', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                  </div>
                ) : transactions.length === 0 ? (
                  <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <Receipt size={24} style={{ color: '#ddd', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 14, color: '#aaa' }}>暂无记录</p>
                  </div>
                ) : (
                  <div>
                    {transactions.map((tx, i) => (
                      <TxRow key={tx.id} tx={tx} last={i === transactions.length - 1} />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

function TxRow({ tx, last }: { tx: Transaction; last: boolean }) {
  const isDebit = tx.amount < 0
  const actionLabel: Record<string, string> = { draft: '文书起草', search: '法律检索', annual_card: '开通年卡', welcome_bonus: '新用户赠送', topup: '充值' }
  const action = tx.metadata?.action as string || tx.metadata?.type as string || ''
  const tag = actionLabel[action] || ''

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 24px',
      borderBottom: last ? 'none' : '1px solid #f5f5f8',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: isDebit ? '#fef2f2' : '#f0fdf4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isDebit
            ? <TrendingDown size={16} style={{ color: '#dc2626' }} />
            : <TrendingUp size={16} style={{ color: '#16a34a' }} />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{tx.description}</p>
            {tag && (
              <span style={{ fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 4, background: '#f5f5f8', color: '#888' }}>
                {tag}
              </span>
            )}
          </div>
          <p style={{ fontSize: 11, color: '#bbb' }}>{new Date(tx.created_at).toLocaleString('zh-CN')}</p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: isDebit ? '#dc2626' : '#16a34a' }}>
          {tx.amount > 0 ? '+' : ''}{formatBalance(tx.amount)}
        </p>
        <p style={{ fontSize: 11, color: '#bbb' }}>余额 {formatBalance(tx.balance_after)}</p>
      </div>
    </div>
  )
}
