'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Folder, Search, BookOpen,
  CreditCard, Settings, LogOut, Zap, Scale,
} from 'lucide-react'

const WORKBENCH = [
  { href: '/dashboard',  icon: LayoutDashboard, label: '使用日志' },
  { href: '/cases',      icon: Folder,          label: '案件管理' },
  { href: '/search',     icon: Search,          label: '法律检索' },
  { href: '/templates',  icon: BookOpen,        label: '模板库'   },
]

const ACCOUNT = [
  { href: '/billing',   icon: CreditCard, label: '账户管理' },
  { href: '/settings',  icon: Settings,   label: '设置'     },
]

export default function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navItem = (href: string, Icon: React.ElementType, label: string) => {
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    return (
      <Link key={href} href={href} style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '8px 10px', borderRadius: 8, marginBottom: 2,
        fontSize: 13, textDecoration: 'none',
        fontWeight: active ? 600 : 400,
        color: active ? '#111' : '#888',
        background: active ? '#f0f0f5' : 'transparent',
        transition: 'background 0.1s',
      }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f5f8' }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
        <Icon size={15} />{label}
      </Link>
    )
  }

  return (
    <aside style={{
      width: 220, display: 'flex', flexDirection: 'column',
      background: '#fff', borderRight: '1px solid #ebebf0', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid #f0f0f5' }}>
        <img src="/logo.png" alt="Linkmai" style={{ width: 30, height: 30, filter: 'brightness(0) drop-shadow(0 0 0.5px #000) drop-shadow(0 0 0.5px #000)' }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>Linkmai</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {/* 工作台 */}
        <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: '0.06em', padding: '4px 10px 8px', textTransform: 'uppercase' as const }}>
          工作台
        </p>
        {WORKBENCH.map(({ href, icon, label }) => navItem(href, icon, label))}

        {/* 账户管理 */}
        <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: '0.06em', padding: '16px 10px 8px', textTransform: 'uppercase' as const }}>
          账户
        </p>
        {ACCOUNT.map(({ href, icon, label }) => navItem(href, icon, label))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #f0f0f5' }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '8px 10px', borderRadius: 8, border: 'none',
          background: 'none', cursor: 'pointer', color: '#999', fontSize: 13,
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#f5f5f8'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <LogOut size={14} />退出登录
        </button>
      </div>
    </aside>
  )
}
