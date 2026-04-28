'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [btnHover, setBtnHover] = useState(false)

  /* ── Black hole canvas animation ── */
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

    // Particles
    const N = 320
    type P = { x: number; y: number; vx: number; vy: number; r: number; alpha: number; speed: number }
    const particles: P[] = Array.from({ length: N }, () => {
      const angle = Math.random() * Math.PI * 2
      const dist = 180 + Math.random() * 340
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0, vy: 0,
        r: 0.4 + Math.random() * 1.2,
        alpha: 0.15 + Math.random() * 0.7,
        speed: 0.00018 + Math.random() * 0.00032,
      }
    })

    let t = 0
    const draw = () => {
      t += 1
      ctx.clearRect(0, 0, w, h)

      const cx = w / 2, cy = h / 2

      // Outer glow rings
      for (let i = 3; i >= 1; i--) {
        const grad = ctx.createRadialGradient(cx, cy, 60 * i, cx, cy, 160 * i)
        grad.addColorStop(0, `rgba(80,120,255,${0.04 / i})`)
        grad.addColorStop(0.5, `rgba(120,80,255,${0.03 / i})`)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, 160 * i, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Accretion disk glow
      const diskGrad = ctx.createRadialGradient(cx, cy, 55, cx, cy, 200)
      diskGrad.addColorStop(0, 'rgba(0,0,0,0)')
      diskGrad.addColorStop(0.3, 'rgba(60,100,255,0.12)')
      diskGrad.addColorStop(0.6, 'rgba(140,80,255,0.08)')
      diskGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.ellipse(cx, cy, 200, 60, 0.3, 0, Math.PI * 2)
      ctx.fillStyle = diskGrad
      ctx.fill()

      // Particles orbit
      particles.forEach(p => {
        const angle = Math.atan2(p.y, p.x) + p.speed * (180 / (Math.sqrt(p.x * p.x + p.y * p.y) + 1) * 8 + 1)
        const dist = Math.sqrt(p.x * p.x + p.y * p.y)
        const pull = 0.012
        const newDist = dist - pull
        if (newDist < 55) {
          const resetAngle = Math.random() * Math.PI * 2
          const resetDist = 220 + Math.random() * 280
          p.x = Math.cos(resetAngle) * resetDist
          p.y = Math.sin(resetAngle) * resetDist
        } else {
          p.x = Math.cos(angle) * newDist
          p.y = Math.sin(angle) * newDist
        }

        const px = cx + p.x, py = cy + p.y
        const proximity = Math.max(0, 1 - dist / 500)
        const blue = Math.floor(180 + proximity * 75)
        const green = Math.floor(80 + proximity * 60)
        ctx.beginPath()
        ctx.arc(px, py, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${120 + proximity * 80},${green},${blue},${p.alpha})`
        ctx.fill()
      })

      // Black hole core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70)
      coreGrad.addColorStop(0, 'rgba(0,0,0,1)')
      coreGrad.addColorStop(0.7, 'rgba(0,0,0,0.98)')
      coreGrad.addColorStop(0.85, 'rgba(20,10,40,0.6)')
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, 70, 0, Math.PI * 2)
      ctx.fillStyle = coreGrad
      ctx.fill()

      // Event horizon ring
      const ringGrad = ctx.createRadialGradient(cx, cy, 52, cx, cy, 72)
      ringGrad.addColorStop(0, 'rgba(0,0,0,0)')
      ringGrad.addColorStop(0.4, `rgba(80,120,255,${0.25 + 0.08 * Math.sin(t * 0.04)})`)
      ringGrad.addColorStop(0.7, `rgba(140,80,255,${0.15 + 0.05 * Math.sin(t * 0.04 + 1)})`)
      ringGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, 72, 0, Math.PI * 2)
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

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
        background: 'rgba(5,5,8,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* SVG logo — scales icon, white version */}
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.08)" />
            <path d="M12 28 L20 12 L28 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M15 23 L25 23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="20" cy="12" r="2" fill="white"/>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.02em', color: '#fff' }}>
            灵迈 <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>Linkmai</span>
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="mailto:contact@linkmai.ai"
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
            联系我们
          </a>
          <Link href="/login"
            style={{
              padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}>
            登录
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

        {/* Canvas */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

        {/* Radial vignette */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(5,5,8,0.6) 70%, rgba(5,5,8,0.95) 100%)',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 680 }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 999,
            background: 'rgba(80,120,255,0.1)',
            border: '1px solid rgba(80,120,255,0.25)',
            fontSize: 12, color: 'rgba(160,180,255,0.9)',
            marginBottom: 32,
            letterSpacing: '0.04em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6080ff', display: 'inline-block', boxShadow: '0 0 8px #6080ff' }} />
            AI 驱动的律师工作平台
          </div>

          {/* Slogan */}
          <h1 style={{
            fontSize: 'clamp(42px, 7vw, 80px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 24,
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(180,200,255,0.9) 40%, rgba(140,100,255,0.85) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            法有源<br />智无限
          </h1>

          {/* Sub */}
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', marginBottom: 48, lineHeight: 1.7 }}>
            让每一位律师都拥有 AI 助理
          </p>

          {/* CTA button */}
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                position: 'relative',
                padding: '0 40px',
                height: 52,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '0.02em',
                overflow: 'hidden',
                background: btnHover
                  ? 'linear-gradient(135deg, #7060ff 0%, #4080ff 50%, #60c0ff 100%)'
                  : 'linear-gradient(135deg, #5040dd 0%, #3060dd 50%, #4090dd 100%)',
                boxShadow: btnHover
                  ? '0 0 40px rgba(100,120,255,0.6), 0 0 80px rgba(80,100,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : '0 0 20px rgba(80,100,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                transform: btnHover ? 'translateY(-2px) scale(1.03)' : 'translateY(0) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              }}>
              {/* Shimmer sweep */}
              <span style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
                transform: btnHover ? 'translateX(100%)' : 'translateX(-100%)',
                transition: 'transform 0.5s ease',
                pointerEvents: 'none',
              }} />
              开始使用
            </button>
          </Link>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, transparent, rgba(5,5,8,0.95))',
        }} />
      </div>

    </div>
  )
}
