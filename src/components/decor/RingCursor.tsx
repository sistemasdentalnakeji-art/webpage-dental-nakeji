// ─────────────────────────────────────────────────────────────────────────────
// CURSOR DE AROS ("multi-follow", inspirado en el ejemplo de Motion en 21st.dev, código propio sin librerías): un punto dorado
// exactamente en el puntero y 4 aros (oro claro, oro, azul claro, azul marca) que lo siguen con distinto retraso, como un eco.
// Al dejar de mover el mouse, y siempre en los menús (header y footer), los aros se juntan en una figura concéntrica
// (punto, aro, aro de trazos y aro exterior) y se quedan quietos. Al hacer clic se contrae. En campos de texto, cursor del sistema.
// • Solo con mouse (hover + puntero fino). Con "Pausar animaciones" / reducir movimiento no se monta (cursor normal).
// • Un solo requestAnimationFrame que se duerme cuando todo llega a su lugar. Estilos → src/styles/components/ring-cursor.css.
// ─────────────────────────────────────────────────────────────────────────────

import '@/styles/components/ring-cursor.css'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { motionOff } from '@/lib/motion'

const FINE = '(hover: hover) and (pointer: fine)'
/** Qué tan rápido alcanza cada aro al puntero (1 = al instante). Del más cercano al más lejano. */
const FOLLOW = [0.32, 0.2, 0.13, 0.085]
/** Zonas de menú: ahí los aros se recogen en su figura y no siguen al puntero con retraso (no estorban la vista). */
const MENU = '.site-header, .site-footer, nav, [role="menu"]'
const TEXT = 'input:not([type="checkbox"], [type="radio"], [type="submit"], [type="button"], [type="range"]), textarea, [contenteditable]'

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(FINE)
  mq.addEventListener('change', cb)
  window.addEventListener('motionchange', cb)
  return () => {
    mq.removeEventListener('change', cb)
    window.removeEventListener('motionchange', cb)
  }
}
const enabled = () => window.matchMedia(FINE).matches && !motionOff()

export function RingCursor() {
  const on = useSyncExternalStore(subscribe, enabled, () => false)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!on) return
    const root = document.documentElement
    root.classList.add('ring-cursor-on')
    const target = { x: -100, y: -100 }
    const rings = FOLLOW.map(() => ({ x: -100, y: -100 }))
    let frame = 0
    let shown = false
    let gathered = false
    let restTimer = 0

    const tick = () => {
      frame = 0
      let moving = false
      rings.forEach((r, i) => {
        // En menús (header y footer) los aros se juntan rápido en su formación y quedan quietos.
        const k = gathered ? 0.4 : FOLLOW[i]
        r.x += (target.x - r.x) * k
        r.y += (target.y - r.y) * k
        if (Math.abs(target.x - r.x) + Math.abs(target.y - r.y) > 0.3) moving = true
        const el = ringRefs.current[i]
        if (el) el.style.translate = `${r.x}px ${r.y}px`
      })
      if (moving) frame = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      target.x = e.clientX
      target.y = e.clientY
      if (dotRef.current) dotRef.current.style.translate = `${target.x}px ${target.y}px`
      if (!shown) {
        // Primera vez: los aros aparecen ya en el puntero (no vuelan desde la esquina).
        rings.forEach((r) => Object.assign(r, target))
        root.dataset.ringCursor = 'shown'
        shown = true
      }
      const el = e.target instanceof Element ? e.target : null
      const text = el?.closest(TEXT)
      gathered = !text && !!el?.closest(MENU)
      root.dataset.ringCursorState = text ? 'text' : gathered ? 'menu' : 'idle'
      // Al dejar de mover el mouse (~0.7 s), los aros forman su figura concéntrica y dejan de moverse.
      root.removeAttribute('data-ring-cursor-rest')
      window.clearTimeout(restTimer)
      restTimer = window.setTimeout(() => root.setAttribute('data-ring-cursor-rest', ''), 700)
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const onDown = () => root.setAttribute('data-ring-cursor-press', '')
    const onUp = () => root.removeAttribute('data-ring-cursor-press')
    const onLeave = () => {
      delete root.dataset.ringCursor
      shown = false
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('pointerup', onUp, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(restTimer)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      root.classList.remove('ring-cursor-on')
      delete root.dataset.ringCursor
      delete root.dataset.ringCursorState
      root.removeAttribute('data-ring-cursor-press')
      root.removeAttribute('data-ring-cursor-rest')
    }
  }, [on])

  if (!on) return null
  return (
    <div className="ring-cursor" aria-hidden="true">
      {FOLLOW.map((_, i) => (
        <div
          key={i}
          ref={(node) => {
            ringRefs.current[i] = node
          }}
            className={`ring-cursor__ring ring-cursor__ring--${i + 1}`}
        />
      ))}
      <div ref={dotRef} className="ring-cursor__dot" />
    </div>
  )
}
