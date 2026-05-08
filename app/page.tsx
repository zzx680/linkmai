'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, X } from 'lucide-react'

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [btnHover, setBtnHover] = useState(false)
  const [btnActive, setBtnActive] = useState(false)
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let w = 0, h = 0

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const N = 480
    type P = { x: number; y: number; r: number; alpha: number; speed: number }
    const particles: P[] = Array.from({ length: N }, () => {
      const angle = Math.random() * Math.PI * 2
      const dist = 260 + Math.random() * 480
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        r: 0.4 + Math.random() * 1.4,
        alpha: 0.12 + Math.random() * 0.65,
        speed: 0.00014 + Math.random() * 0.00028,
      }
    })

    let t = 0
    const draw = () => {
      t += 1
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2, cy = h / 2

      // Outer glow rings — white/gray only
      for (let i = 4; i >= 1; i--) {
        const grad = ctx.createRadialGradient(cx, cy, 80 * i, cx, cy, 220 * i)
        grad.addColorStop(0, `rgba(255,255,255,${0.025 / i})`)
        grad.addColorStop(0.5, `rgba(200,200,200,${0.015 / i})`)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, 220 * i, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Accretion disk — white glow
      const diskGrad = ctx.createRadialGradient(cx, cy, 80, cx, cy, 320)
      diskGrad.addColorStop(0, 'rgba(0,0,0,0)')
      diskGrad.addColorStop(0.25, 'rgba(255,255,255,0.07)')
      diskGrad.addColorStop(0.55, 'rgba(180,180,180,0.04)')
      diskGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.ellipse(cx, cy, 320, 90, 0.3, 0, Math.PI * 2)
      ctx.fillStyle = diskGrad
      ctx.fill()

      // Particles
      particles.forEach(p => {
        const angle = Math.atan2(p.y, p.x) + p.speed * (260 / (Math.sqrt(p.x * p.x + p.y * p.y) + 1) * 8 + 1)
        const dist = Math.sqrt(p.x * p.x + p.y * p.y)
        const pull = 0.014
        const newDist = dist - pull
        if (newDist < 80) {
          const resetAngle = Math.random() * Math.PI * 2
          const resetDist = 300 + Math.random() * 420
          p.x = Math.cos(resetAngle) * resetDist
          p.y = Math.sin(resetAngle) * resetDist
        } else {
          p.x = Math.cos(angle) * newDist
          p.y = Math.sin(angle) * newDist
        }

        const px = cx + p.x, py = cy + p.y
        const proximity = Math.max(0, 1 - dist / 700)
        const brightness = Math.floor(160 + proximity * 95)
        ctx.beginPath()
        ctx.arc(px, py, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${brightness},${brightness},${brightness},${p.alpha})`
        ctx.fill()
      })

      // Black hole core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100)
      coreGrad.addColorStop(0, 'rgba(0,0,0,1)')
      coreGrad.addColorStop(0.75, 'rgba(0,0,0,0.98)')
      coreGrad.addColorStop(0.9, 'rgba(8,8,8,0.6)')
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, 100, 0, Math.PI * 2)
      ctx.fillStyle = coreGrad
      ctx.fill()

      // Event horizon ring — white shimmer
      const pulse = 0.18 + 0.06 * Math.sin(t * 0.035)
      const ringGrad = ctx.createRadialGradient(cx, cy, 76, cx, cy, 108)
      ringGrad.addColorStop(0, 'rgba(0,0,0,0)')
      ringGrad.addColorStop(0.35, `rgba(255,255,255,${pulse})`)
      ringGrad.addColorStop(0.7, `rgba(200,200,200,${pulse * 0.55})`)
      ringGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, 108, 0, Math.PI * 2)
      ctx.fillStyle = ringGrad
      ctx.fill()

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{ background: '#050508', minHeight: '100vh', color: '#fff', fontFamily: "-apple-system,'PingFang SC','Helvetica Neue',system-ui,sans-serif", overflow: 'hidden' }}>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
        background: 'rgba(5,5,8,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <img src="/logo.png" alt="Linkmai" style={{ width: 28, height: 28, filter: 'brightness(0) invert(1) drop-shadow(0 0 0.5px #fff) drop-shadow(0 0 0.5px #fff)' }} />
          <span style={{
            fontSize: 14, fontWeight: 700, letterSpacing: '0.02em',
            color: 'transparent',
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.85) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.25))',
          }}>
            Linkmai
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setShowContact(true)}
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
            联系我们
          </button>
          <Link href="/login"
            style={{
              padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: 'rgba(255,255,255,0.8)', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.05)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}>
            登录
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 65% 65% at 50% 50%, transparent 25%, rgba(5,5,8,0.55) 65%, rgba(5,5,8,0.92) 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 720 }}>

          {/* Main title */}
          <h1 style={{
            fontSize: 'clamp(52px, 8.5vw, 96px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            marginBottom: 20,
            color: 'transparent',
            backgroundImage: 'linear-gradient(160deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.75) 40%, rgba(255,255,255,0.55) 70%, rgba(255,255,255,0.85) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.18)) drop-shadow(0 2px 12px rgba(255,255,255,0.1))',
          }}>
            Linkmai
          </h1>

          {/* Slogan */}
          <p style={{
            fontSize: 'clamp(20px, 2.8vw, 30px)',
            fontWeight: 300,
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.55)',
            marginBottom: 52,
          }}>
            法有源 · 智无限
          </p>

          {/* CTA */}
          <Link href="/login?invite=true" style={{ textDecoration: 'none' }}>
            <button
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => { setBtnHover(false); setBtnActive(false) }}
              onMouseDown={() => setBtnActive(true)}
              onMouseUp={() => setBtnActive(false)}
              style={{
                position: 'relative',
                padding: '0 48px',
                height: 54,
                borderRadius: 999,
                border: btnHover
                  ? '1px solid rgba(255,255,255,0.45)'
                  : '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 500,
                color: '#fff',
                letterSpacing: '0.06em',
                overflow: 'hidden',
                background: btnActive
                  ? 'rgba(255,255,255,0.04)'
                  : btnHover
                    ? 'radial-gradient(ellipse 120% 120% at 50% 140%, rgba(255,255,255,0.12) 0%, rgba(30,30,30,0.75) 60%)'
                    : 'rgba(28,28,28,0.75)',
                boxShadow: btnHover
                  ? '0 0 32px rgba(255,255,255,0.08), 0 0 80px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(255,255,255,0.03)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                transform: btnActive
                  ? 'translateY(0) scale(0.97)'
                  : btnHover
                    ? 'translateY(-3px) scale(1.04)'
                    : 'translateY(0) scale(1)',
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
              }}>
              {/* Event horizon ring glow — mimics the canvas ring */}
              <span style={{
                position: 'absolute',
                inset: -1,
                borderRadius: 999,
                background: 'transparent',
                boxShadow: btnHover
                  ? '0 0 0 1px rgba(255,255,255,0.25), 0 0 20px 2px rgba(255,255,255,0.08)'
                  : '0 0 0 0px rgba(255,255,255,0)',
                transition: 'box-shadow 0.4s ease',
                pointerEvents: 'none',
              }} />
              {/* Shimmer sweep */}
              <span style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.15) 50%, transparent 80%)',
                transform: btnHover ? 'translateX(100%)' : 'translateX(-100%)',
                transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
                pointerEvents: 'none',
              }} />
              {/* Radial pulse from bottom — like accretion disk */}
              <span style={{
                position: 'absolute', inset: 0,
                borderRadius: 999,
                background: btnHover
                  ? 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,255,255,0.1) 0%, transparent 70%)'
                  : 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,255,255,0) 0%, transparent 70%)',
                transition: 'background 0.4s ease',
                pointerEvents: 'none',
              }} />
              <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: btnHover ? 8 : 0, transition: 'gap 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
                立即体验
                <span style={{
                  display: 'inline-flex', alignItems: 'center', overflow: 'hidden',
                  width: btnHover ? 18 : 0,
                  opacity: btnHover ? 1 : 0,
                  transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease',
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </span>
            </button>
          </Link>
        </div>

        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, transparent, rgba(5,5,8,0.96))',
        }} />
      </div>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  )
}

function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [firm, setFirm] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim() || !contact.trim() || !message.trim()) { setError('请填写姓名、联系方式和留言'); return }
    setLoading(true); setError('')
    const r = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contact, firm, message }),
    })
    const data = await r.json()
    if (!r.ok) { setError(data.error || '提交失败'); setLoading(false); return }
    setDone(true)
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f0f0f5' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>联系我们</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f5f5f8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l5 5 7-8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 6 }}>已收到您的留言</p>
              <p style={{ fontSize: 13, color: '#888' }}>我们会在 24 小时内与您联系</p>
              <button onClick={onClose} style={{ marginTop: 20, height: 40, padding: '0 28px', borderRadius: 10, background: '#111', color: '#fff', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer' }}>关闭</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="姓名 *" style={{ flex: 1, height: 42, borderRadius: 8, border: 'none', background: '#f5f5f8', padding: '0 14px', fontSize: 14, color: '#111', outline: 'none' }} />
                <input value={contact} onChange={e => setContact(e.target.value)} placeholder="手机 / 邮箱 *" style={{ flex: 1, height: 42, borderRadius: 8, border: 'none', background: '#f5f5f8', padding: '0 14px', fontSize: 14, color: '#111', outline: 'none' }} />
              </div>
              <input value={firm} onChange={e => setFirm(e.target.value)} placeholder="律所（选填）" style={{ height: 42, borderRadius: 8, border: 'none', background: '#f5f5f8', padding: '0 14px', fontSize: 14, color: '#111', outline: 'none' }} />
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="留言内容 *" rows={4} style={{ borderRadius: 8, border: 'none', background: '#f5f5f8', padding: '12px 14px', fontSize: 14, color: '#111', resize: 'none', outline: 'none', fontFamily: 'inherit' }} />
              {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
              <button onClick={handleSubmit} disabled={loading} style={{ height: 44, borderRadius: 10, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />提交中...</> : '提交留言'}
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
