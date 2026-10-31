// ─────────────────────────────────────────────────────────────────────────────
// FONDO DE PARTÍCULAS (estilo particles.js): CareStory, Servicios destacados y Agendar (menos partículas) del homepage.
// • Unas 140 partículas por cada 800×800 px que flotan al azar, rebotan en los bordes, titilan y cambian de tamaño; las
//   cercanas (160 px) se unen con líneas.
// • Prisma: el color corre por la paleta de la marca (oro → blanco → azul claro → azul) a lo ancho de la banda, y al acercar
//   el mouse las partículas se conectan con el cursor en un abanico oro → blanco → azul según el ángulo.
// • Un clic agrega 4 partículas donde se hizo.
// • `avoid`: selector de un elemento (el diente de CareStory) alrededor del cual las partículas y líneas se desvanecen.
// Sin librería ni CDN (la CSP de vercel.json no permite scripts externos). Se pasa como `decor` de una Band: queda encima
// del fondo y debajo del contenido (particles-bg.css, que también lo oculta en celular y tableta). Respeta "Pausar
// animaciones" / "reducir movimiento" (queda quieto) y se detiene fuera de pantalla.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { motionOff } from '@/lib/motion'
import { BRAND, GOLD, SKY, WHITE, paletteAt, rgba } from './palette'

/** Abanico de luz, del oro al azul (el "arcoíris" de la marca). */
const FAN = [GOLD, [240, 214, 150], WHITE, SKY, [90, 152, 214], BRAND]
/** Distancias (px a 1440 de ancho): líneas entre partículas y alcance del mouse. */
const LINK = 160
const GRAB = 220
/** Partículas por cada 800×800 px y tope (las líneas se revisan por pares). */
const DENSITY = 140
const MAX = 200
const PUSH = 4

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  /** Radio máximo (1…3) y fase del titileo y del tamaño. */
  r: number
  phase: number
}

const spawn = (x: number, y: number): Particle => {
  const a = Math.random() * Math.PI * 2
  const v = 0.3 + Math.random() * 0.7
  return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 1 + Math.random() * 2, phase: Math.random() * 6 }
}

/** Hueco alrededor de `avoid`: vacío hasta HOLE × su tamaño y se llena en FADE px más. */
const HOLE = 1.1
const FADE = 110

interface ParticlesProps {
  /** Partículas por cada 800×800 px. */
  density?: number
  /** Tope de partículas (las líneas se revisan por pares). */
  max?: number
  /** Selector del elemento que debe quedar libre de partículas (se sigue cuadro a cuadro: puede moverse). */
  avoid?: string
}

export function ParticlesBackground({ density = DENSITY, max = MAX, avoid }: ParticlesProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const host = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !host || !ctx) return

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let mouse: { x: number; y: number } | null = null
    let visible = false
    let frame = 0
    let last = 0
    let time = 0

    const scale = () => Math.min(1.2, Math.max(0.65, width / 1440))
    /** Color de prisma según la posición horizontal (y corre despacio con el tiempo). */
    const tint = (x: number) => paletteAt((x / width) * 1.5 + time * 0.05)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      // Opacidad de cada partícula según su distancia al elemento que se evita (1 = sin hueco).
      const box = avoid ? document.querySelector(avoid)?.getBoundingClientRect() : undefined
      const origin = canvas.getBoundingClientRect()
      const fade = particles.map((p) => {
        if (!box?.width) return 1
        const d = Math.hypot(p.x + origin.left - (box.left + box.width / 2), p.y + origin.top - (box.top + box.height / 2))
        const inner = (Math.max(box.width, box.height) / 2) * HOLE
        return Math.min(1, Math.max(0, (d - inner) / FADE))
      })
      const link = LINK * scale()
      ctx.lineWidth = 1.2
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          const f = Math.min(fade[i], fade[j])
          if (d >= link || !f) continue
          ctx.strokeStyle = rgba(tint((a.x + b.x) / 2), 0.4 * (1 - d / link) * f)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      if (mouse) {
        const grab = GRAB * scale()
        for (const [i, p] of particles.entries()) {
          const d = Math.hypot(p.x - mouse.x, p.y - mouse.y)
          if (d >= grab || !fade[i]) continue
          // Abanico de prisma: el color depende del ángulo con que la partícula ve al cursor.
          const angle = Math.atan2(p.y - mouse.y, p.x - mouse.x) / Math.PI
          ctx.strokeStyle = rgba(FAN[Math.floor(((angle + 1) / 2) * FAN.length) % FAN.length], 0.8 * (1 - d / grab) * fade[i])
          ctx.beginPath()
          ctx.moveTo(mouse.x, mouse.y)
          ctx.lineTo(p.x, p.y)
          ctx.stroke()
        }
      }

      for (const [i, p] of particles.entries()) {
        if (!fade[i]) continue
        const wave = Math.sin(time + p.phase)
        ctx.fillStyle = rgba(tint(p.x), (0.5 + 0.2 * wave) * fade[i])
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(1, p.r * (0.75 + 0.25 * wave)), 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const tick = (now: number) => {
      frame = 0
      // Pasos medidos en tiempo (no en cuadros) para moverse igual en pantallas de 60 y de 120 Hz.
      const step = last ? Math.min(0.05, (now - last) / 1000) * 60 : 1
      last = now
      time += step / 60
      for (const p of particles) {
        p.x += p.vx * step
        p.y += p.vy * step
        if (p.x < 0 || p.x > width) p.vx = -p.vx
        if (p.y < 0 || p.y > height) p.vy = -p.vy
      }
      draw()
      play()
    }

    const play = () => {
      if (motionOff()) last = 0
      else if (!frame && visible && width) frame = requestAnimationFrame(tick)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(max, Math.round((density * width * height) / (800 * 800)))
      particles = Array.from({ length: count }, () => spawn(Math.random() * width, Math.random() * height))
      draw()
      play()
    }

    // El mouse se escucha en la sección entera: el lienzo va debajo del contenido y no recibe eventos.
    const point = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onMove = (e: PointerEvent) => {
      mouse = point(e)
      if (motionOff()) draw()
    }
    const onLeave = () => {
      mouse = null
      if (motionOff()) draw()
    }
    const onDown = (e: PointerEvent) => {
      const { x, y } = point(e)
      particles.push(...Array.from({ length: PUSH }, () => spawn(x, y)))
      // Las más viejas salen primero para no pasar del tope.
      if (particles.length > max) particles.splice(0, particles.length - max)
      if (motionOff()) draw()
    }

    const sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(canvas)
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      last = 0
      play()
    })
    viewObserver.observe(canvas)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    window.addEventListener('motionchange', play)
    return () => {
      cancelAnimationFrame(frame)
      sizeObserver.disconnect()
      viewObserver.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      window.removeEventListener('motionchange', play)
    }
  }, [density, max, avoid])

  return <canvas ref={ref} className="particles-bg" aria-hidden="true" />
}
