'use client'

import Link from 'next/link'
import { ArrowLeft, MessageSquare, Gift, Zap, Receipt, Coins, Check } from 'lucide-react'

const HOW_IT_WORKS = [
  {
    icon: Coins,
    title: '充值余额',
    desc: '选择充值档位，微信/支付宝支付。余额永不过期，随时可用。',
  },
  {
    icon: Zap,
    title: '按结果扣费',
    desc: '每次 AI 起草完成后扣 ¥19，法律检索扣 ¥3。不生成不扣钱。',
  },
  {
    icon: Receipt,
    title: '透明账单',
    desc: '每次操作后实时显示扣费金额和剩余余额，完整消费记录随时查看。',
  },
]

const PRICING_TABLE = [
  { action: 'AI 文书起草（含法律检索）', payg: '¥19/份', card: '¥9/份', note: '诉状、合同、律师函等' },
  { action: '独立法律检索', payg: '¥3/次', card: '¥1.5/次', note: '单独使用检索功能' },
  { action: '案件管理', payg: '免费', card: '免费', note: '案件、文档管理' },
  { action: 'DOCX 导出', payg: '免费', card: '免费', note: '文书格式化导出' },
]

const TOP_UP_PACKS = [
  { id: 'pack_50',  label: '入门包', price: 50,  drafts: 2  },
  { id: 'pack_100', label: '标准包', price: 100, drafts: 5  },
  { id: 'pack_300', label: '进阶包', price: 300, drafts: 15 },
  { id: 'pack_500', label: '专业包', price: 500, drafts: 26 },
]

const FAQS = [
  {
    q: '年卡和充值有什么区别？',
    a: '充值是按次付费，每份文书 ¥19。年卡是一次性付 ¥1,280，之后每份文书只需 ¥9，相当于打了 5 折。每月起草 9 份以上，年卡就比充值划算。',
  },
  {
    q: '怎么判断年卡值不值？',
    a: '算一下：如果你每月起草 9 份以上文书，年卡每月帮你省 ¥90+，一年省 ¥1,080+，年卡费用 ¥1,280 大约 14 个月回本。用得越多，省得越多。',
  },
  {
    q: '充值余额会过期吗？',
    a: '不会。充值余额永久有效，没有使用期限。',
  },
  {
    q: '新用户有体验机会吗？',
    a: '新注册用户赠送 1 次免费文书起草，完整体验 AI 起草全流程后再决定是否充值。',
  },
  {
    q: '年卡到期后怎么办？',
    a: '年卡到期后自动恢复按次计费（¥19/份），余额不受影响，续费年卡即可继续享受折扣。',
  },
  {
    q: '支持哪些支付方式？',
    a: '支持微信支付和支付宝。律所客户可联系我们开具增值税发票，支持对公转账。',
  },
]

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif" }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 60,
        background: 'rgba(5,5,8,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Linkmai" style={{ width: 28, height: 28, filter: 'brightness(0) invert(1) drop-shadow(0 0 0.5px #fff) drop-shadow(0 0 0.5px #fff)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Linkmai</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
            <ArrowLeft size={13} />返回首页
          </Link>
          <Link href="/login" style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}>
            登录
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 10 }}>
            按结果付费，用多少花多少
          </h1>
          <p style={{ fontSize: 15, color: '#888', maxWidth: 480, margin: '0 auto' }}>
            充值余额按次扣费，或开通年卡享受 5 折优惠。新用户赠送 1 次免费起草。
          </p>
        </div>

        {/* Two tracks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 56 }}>

          {/* Pay-as-you-go */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ebebf0', padding: '32px 28px' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 16 }}>按次充值</p>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>¥19</span>
              <span style={{ fontSize: 14, color: '#aaa', marginLeft: 4 }}>/份文书</span>
            </div>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 28 }}>偶尔使用，用多少充多少，余额永不过期</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {[
                '文书起草 ¥19/份（含法律检索）',
                '独立法律检索 ¥3/次',
                '案件管理免费',
                'DOCX 导出免费',
                '余额永不过期',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Check size={14} style={{ color: '#555', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#555' }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Top-up packs */}
            <p style={{ fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 10 }}>充值档位</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TOP_UP_PACKS.map(pack => (
                <Link key={pack.id} href="/login" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '12px 8px', borderRadius: 10, border: '1px solid #ebebf0',
                  textDecoration: 'none', background: '#fafafa', transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#111'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#ebebf0'}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>¥{pack.price}</span>
                  <span style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>约 {pack.drafts} 份文书</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Annual card */}
          <div style={{ background: '#111', borderRadius: 16, border: '1px solid #222', padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
            {/* Background texture */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />

            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>年卡会员</p>
                <span style={{ fontSize: 10, fontWeight: 600, background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: 20 }}>5 折</span>
              </div>

              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>¥9</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>/份文书</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>¥19/份</span>
                <span style={{ fontSize: 12, color: '#4ade80' }}>每份省 ¥10</span>
              </div>

              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>年费</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>¥1,280<span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>/年（月均 ¥107）</span></p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {[
                  '文书起草 ¥9/份（5折）',
                  '独立法律检索 ¥1.5/次（5折）',
                  '案件管理免费',
                  'DOCX 导出免费',
                  '每月起草 9 份即回本',
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Check size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/login" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                height: 44, borderRadius: 10, fontSize: 14, fontWeight: 600,
                textDecoration: 'none', background: '#fff', color: '#111',
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <Zap size={14} />开通年卡
              </Link>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 56 }}>
          {HOW_IT_WORKS.map((item, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #ebebf0', padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#2563eb' }}>
                <item.icon size={20} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6 }}>{item.title}</p>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing comparison table */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ebebf0', overflow: 'hidden', marginBottom: 56 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0f5' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>价格对比</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#aaa', borderBottom: '1px solid #f0f0f5', width: '40%' }}>操作</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#555', borderBottom: '1px solid #f0f0f5' }}>按次充值</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#2563eb', borderBottom: '1px solid #f0f0f5' }}>年卡会员</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#aaa', borderBottom: '1px solid #f0f0f5' }}>说明</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_TABLE.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < PRICING_TABLE.length - 1 ? '1px solid #f5f5f8' : 'none' }}>
                  <td style={{ padding: '13px 24px', fontSize: 13, color: '#333', fontWeight: 500 }}>{row.action}</td>
                  <td style={{ padding: '13px 16px', textAlign: 'center', fontSize: 13, color: '#555' }}>{row.payg}</td>
                  <td style={{ padding: '13px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: row.card === '免费' ? '#16a34a' : '#2563eb' }}>{row.card}</td>
                  <td style={{ padding: '13px 16px', fontSize: 12, color: '#aaa' }}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 680, margin: '0 auto 56px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 24, textAlign: 'center' }}>常见问题</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebf0', padding: '16px 20px' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 6 }}>{faq.q}</p>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise CTA */}
        <div style={{ textAlign: 'center', padding: '40px 24px', background: '#fff', borderRadius: 16, border: '1px solid #ebebf0' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 6 }}>律所定制方案</p>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>对公账户统一充值 · 增值税发票 · 专属折扣 · 私有部署</p>
          <a href="mailto:contact@linkmai.ai" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 42, padding: '0 28px', borderRadius: 10, background: '#111', color: '#fff', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            <MessageSquare size={14} />联系我们
          </a>
        </div>

      </main>
    </div>
  )
}
