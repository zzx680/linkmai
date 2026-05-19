'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Database, Cpu, Trash2, Mail } from 'lucide-react'

const SECTIONS = [
  {
    icon: Shield,
    title: '数据安全承诺',
    content: [
      '所有数据传输均通过 HTTPS 加密，防止传输过程中的拦截。',
      '数据库层面启用行级安全策略（Row Level Security），每位用户只能访问自己的数据，从技术层面杜绝越权访问。',
      '我们不会将您的数据出售、租借或以任何形式提供给第三方用于商业目的。',
    ],
  },
  {
    icon: Database,
    title: '数据存储',
    content: [
      '您的案件、文书、检索记录存储在 Supabase 托管的 PostgreSQL 数据库中，服务器位于新加坡（ap-southeast-1）。',
      '合同审查功能：您上传或粘贴的合同原文仅在服务器内存中处理，不会被写入数据库。我们只保存 AI 提取的结构化结果（摘要、标记、引用片段）。',
      '材料上传功能：上传的证据材料文本会存储在数据库中，以便您在案件工作台中随时调用。您可以在案件详情页手动删除任意材料。',
    ],
  },
  {
    icon: Cpu,
    title: 'AI 处理',
    content: [
      '我们使用 DeepSeek API 提供 AI 能力。根据 DeepSeek 服务条款，通过 API 调用传入的数据不会被用于模型训练。',
      '您的文书内容、合同文本、检索查询会作为 prompt 发送至 DeepSeek API 进行处理，处理完成后不在 DeepSeek 服务器上留存。',
      '我们不使用任何消费级 AI 产品（如 ChatGPT 网页版）处理您的数据，所有 AI 调用均通过企业级 API 接口进行。',
    ],
  },
  {
    icon: Trash2,
    title: '数据保留与删除',
    content: [
      '您的数据在账号存续期间保留。您可以随时在"设置 → 账号信息"中申请删除账号，删除后您的所有案件、文书、材料、交易记录将被永久清除，不可恢复。',
      '如需导出数据，请在删除账号前手动导出所需文书（DOCX 格式）。',
      '我们会在收到删除请求后 7 个工作日内完成数据清除。',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6fa',
      fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif",
    }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 60,
        background: '#fff',
        borderBottom: '1px solid #ebebf0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Linkmai" style={{ width: 26, height: 26, filter: 'brightness(0)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Linkmai</span>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, fontSize: 13, color: '#888', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.color = '#111'}
          onMouseLeave={e => e.currentTarget.style.color = '#888'}>
          <ArrowLeft size={13} />返回首页
        </Link>
      </nav>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0f4ff', borderRadius: 20, padding: '6px 14px', marginBottom: 16 }}>
            <Shield size={13} style={{ color: '#2563eb' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>隐私政策</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 12 }}>
            我们如何保护您的数据
          </h1>
          <p style={{ fontSize: 15, color: '#888', lineHeight: 1.7 }}>
            律师行业对数据保密有严格的职业义务。我们在产品设计上将数据安全作为首要原则，而不是事后补救。
          </p>
          <p style={{ fontSize: 12, color: '#bbb', marginTop: 12 }}>最后更新：2026 年 5 月</p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {SECTIONS.map(({ icon: Icon, title, content }) => (
            <div key={title} style={{ background: '#fff', borderRadius: 14, border: '1px solid #ebebf0', padding: '28px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: '#2563eb' }} />
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{title}</h2>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {content.map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: 8 }} />
                    <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, margin: 0 }}>{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{ marginTop: 32, background: '#111', borderRadius: 14, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>有数据安全方面的问题？</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>联系我们，我们会在 24 小时内回复。</p>
          </div>
          <a href="mailto:hk.charlie@163.com" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 20px', borderRadius: 10, background: '#fff', color: '#111', fontSize: 13, fontWeight: 500, textDecoration: 'none', flexShrink: 0 }}>
            <Mail size={14} />联系我们
          </a>
        </div>

      </main>
    </div>
  )
}
