import React, { useEffect, useRef } from 'react'

// Lightweight click-spark effect without external deps
export default function ClickSparkShim({ children }) {
  const wrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const particlesRef = useRef([])

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return

    const ctx = canvas.getContext('2d')

    const resize = () => {
      const rect = wrapper.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrapper)

    const createBurst = (x, y) => {
      const count = 16
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
        const speed = 1.6 + Math.random() * 1.4
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#22d3ee' : '#ffffff'
        })
      }
    }

    const step = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = particlesRef.current.filter(p => p.life > 0)
      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.02
        p.life -= 0.02
        ctx.globalAlpha = Math.max(p.life, 0)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)

    const onClick = (e) => {
      const rect = wrapper.getBoundingClientRect()
      createBurst(e.clientX - rect.left, e.clientY - rect.top)
    }
    wrapper.addEventListener('click', onClick)

    return () => {
      wrapper.removeEventListener('click', onClick)
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <span
      ref={wrapperRef}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          mixBlendMode: 'screen'
        }}
      />
    </span>
  )
}


