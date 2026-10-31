import { useEffect, useRef } from 'react'
import { motionOff } from '@/lib/motion'
import { paletteAt, rgba } from '../palette'

// ─────────────────────────────────────────────────────────────────────────────
// CÍRCULO CON SILUETAS en versión red de prismas: los mismos anillos concéntricos que respiran alrededor del círculo
// central, ahora con el estilo del fondo de partículas (colores de prisma de la marca):
// • Nodos que orbitan cada anillo (unos en un sentido y otros al revés) dejando una estela de luz sobre su anillo.
// • Cada pocos segundos sale una onda del centro: los anillos y los nodos que toca se encienden (crecen y alargan su
//   estela), como una recomendación que se contagia de una persona a otra.
// En el inicio hay dos: Reseñas de Google (escritorio) y Contacto (escritorio y celular). No agregar más sin avisar.
// Estilos y posiciones → ./rings.css. Va dentro del `decor` de una Band: por encima del fondo, por debajo del contenido.
// Respeta "Pausar animaciones" / "reducir movimiento" (queda quieto) y se detiene fuera de pantalla.
// ─────────────────────────────────────────────────────────────────────────────

/** reviews: escritorio (arriba a la izquierda de Reseñas); contact: escritorio (arriba a la derecha). */
export type RingsPlacement = 'reviews' | 'contact'

/** Radios en un lienzo de 600×600 con el centro en medio (se escala al tamaño del elemento). */
const RING_RADII = [72, 122, 172, 222, 272]
const CENTER = 30
/** Nodos del primer anillo; cada anillo hacia afuera lleva 3 más. */
const NODES = 5
/** Largo de la estela de cada nodo (radianes sobre su anillo) y en cuántos tramos se dibuja (cada uno más tenue). */
const TRAIL = 0.45
const TRAIL_STEPS = 8
/** Cada cuántos segundos sale una onda del centro y a qué velocidad crece (unidades por segundo). */
const PULSE_EVERY = 2.6
const PULSE_SPEED = 170

interface Node {
  ring: number
  angle: number
  speed: number
  phase: number
}

export function Rings({ placement }: { placement: RingsPlacement }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Reseñas: sin el anillo exterior, que cruzaba la palabra "Google".
    const radii = RING_RADII.slice(0, { reviews: 4, contact: 5 }[placement])
    const nodes: Node[] = radii.flatMap((_, ring) =>
      Array.from({ length: NODES + ring * 3 }, (_, k) => ({
        ring,
        angle: (k / (NODES + ring * 3)) * Math.PI * 2 + Math.random() * 0.6,
        // Anillos alternos giran al revés; los de adentro, más rápido.
        speed: (ring % 2 ? -1 : 1) * (0.22 - ring * 0.025) * (0.7 + Math.random() * 0.6),
        phase: Math.random() * 6,
      })),
    )

    let size = 0
    let visible = false
    let frame = 0
    let last = 0
    let time = 0

    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      if (!size) return
      ctx.save()
      ctx.translate(size / 2, size / 2)
      ctx.scale(size / 600, size / 600)
      const hue = (x: number, y: number) => paletteAt(Math.atan2(y, x) / Math.PI + time * 0.08)
      // Radio de cada anillo al respirar (como antes: +8 en 12 s + 1.5 s por anillo).
      const radius = radii.map((r, i) => r + 4 * (1 - Math.cos((2 * Math.PI * (time + i * 2)) / (12 + i * 1.5))))
      const pulse = (time % PULSE_EVERY) * PULSE_SPEED
      /** Brillo de la onda en el radio `r` (1 en el frente de la onda). */
      const wave = (r: number) => Math.max(0, 1 - Math.abs(r - pulse) / 40)

      // Anillos: el trazo de siempre, con el degradado de prisma girando.
      radius.forEach((r, i) => {
        const gradient = ctx.createConicGradient(time * 0.3 + i, 0, 0)
        for (let k = 0; k <= 4; k++) gradient.addColorStop(k / 4, rgba(paletteAt(k / 2), 1))
        ctx.strokeStyle = gradient
        ctx.globalAlpha = Math.min(1, 0.45 - i * 0.06 + wave(r) * 0.5)
        ctx.lineWidth = 1.5 + wave(r) * 1.5
        ctx.beginPath()
        ctx.arc(0, 0, r, 0, Math.PI * 2)
        ctx.stroke()
      })
      ctx.globalAlpha = 1

      const points = nodes.map((n) => {
        const r = radius[n.ring]
        const a = n.angle + time * n.speed
        return { x: Math.cos(a) * r, y: Math.sin(a) * r, r, a, dir: Math.sign(n.speed), glow: wave(r), phase: n.phase }
      })

      // Estelas: arcos sobre el propio anillo, detrás del nodo, que se apagan hacia la cola.
      ctx.lineCap = 'round'
      for (const p of points) {
        const step = (TRAIL * (1 + p.glow)) / TRAIL_STEPS
        for (let k = 0; k < TRAIL_STEPS; k++) {
          const from = p.a - p.dir * step * k
          ctx.strokeStyle = rgba(hue(p.x, p.y), (0.75 + p.glow * 0.25) * (1 - k / TRAIL_STEPS))
          ctx.lineWidth = (2.6 + p.glow * 2) * (1 - k / TRAIL_STEPS)
          ctx.beginPath()
          ctx.arc(0, 0, p.r, Math.min(from, from - p.dir * step), Math.max(from, from - p.dir * step))
          ctx.stroke()
        }
      }

      for (const p of points) {
        const twinkle = Math.sin(time * 3 + p.phase)
        ctx.fillStyle = rgba(hue(p.x, p.y), Math.min(1, 0.7 + 0.2 * twinkle + p.glow * 0.3))
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3 + twinkle + p.glow * 4, 0, Math.PI * 2)
        ctx.fill()
      }

      // Círculo central (solo contorno, sin relleno): late y se ilumina cuando sale cada onda.
      const beat = Math.max(0, 1 - pulse / 60)
      ctx.strokeStyle = rgba(paletteAt(time * 0.1 + 0.5), 0.7 + beat * 0.3)
      ctx.lineWidth = 1.5 + beat * 1.5
      ctx.beginPath()
      ctx.arc(0, 0, CENTER + 2 * Math.sin(time) + beat * 6, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    const tick = (now: number) => {
      frame = 0
      time += last ? Math.min(0.05, (now - last) / 1000) : 0
      last = now
      draw()
      play()
    }

    const play = () => {
      if (motionOff()) last = 0
      else if (!frame && visible && size) frame = requestAnimationFrame(tick)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      size = canvas.clientWidth
      canvas.width = size * dpr
      canvas.height = size * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
      play()
    }

    const sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(canvas)
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      last = 0
      play()
    })
    viewObserver.observe(canvas)
    window.addEventListener('motionchange', play)
    return () => {
      cancelAnimationFrame(frame)
      sizeObserver.disconnect()
      viewObserver.disconnect()
      window.removeEventListener('motionchange', play)
    }
  }, [placement])

  return <canvas ref={ref} className={`decor-rings decor-rings--${placement}`} aria-hidden="true" />
}
