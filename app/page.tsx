'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [btnHover, setBtnHover] = useState(false)
  const [btnActive, setBtnActive] = useState(false)

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
              <path d="M12 28 L20 12 L28 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M15 23 L25 23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="20" cy="12" r="2" fill="white"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.02em', color: '#fff' }}>
            灵迈 <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>Linkmai</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="mailto:contact@linkmai.ai"
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
            联系我们
          </a>
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
            color: '#ffffff',
          }}>
            灵迈Linkmai
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
          <Link href="/login" style={{ textDecoration: 'none' }}>
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

    </div>
  )
}
