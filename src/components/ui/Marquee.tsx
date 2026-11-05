import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { motionOff } from '@/lib/motion'

interface MarqueeProps {
  label: string
  items: ReactNode[]
  /** Hacia dónde se mueven las tarjetas. */
  direction: 'ltr' | 'rtl'
  /** Segundos que tarda cada tarjeta en recorrer su propio ancho: más alto = más lento. */
  secondsPerCard?: number
  className?: string
}

// Cada grupo repite las tarjetas para llenar pantallas anchas aunque haya pocas; el segundo grupo es el que cierra el ciclo sin salto.
const REPEATS = 2
const RESUME_MS = 1500
const MOBILE = '(max-width: 767px)'

/**
 * Fila de tarjetas que corre sola moviendo scrollLeft (así el dedo puede deslizarla en ambos sentidos). Se detiene con el
 * cursor, el foco, el toque y fuera de pantalla; al soltar sigue tras 1,5 s. En celular va al doble de rápido. Con movimiento
 * reducido o "Pausar animaciones" no corre sola pero sí se desliza. Solo la primera copia es accesible.
 */
export function Marquee({ label, items, direction, secondsPerCard = 11, className }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    const first = el?.querySelector<HTMLElement>('.marquee__item')
    if (!el || !first) return
    const mobile = window.matchMedia(MOBILE)
    let pos = 0
    let holdUntil = 0
    let hold = 0 // toque, cursor o foco activos
    let visible = false
    let last = 0
    let raf = 0
    const half = () => el.scrollWidth / 2
    // Rango [low, low + half): al salir por un lado se salta media pista, que se ve igual.
    const low = () => Math.max(0, (half() - el.clientWidth) / 2)
    const wrap = () => {
      const h = half()
      if (h <= el.clientWidth) return
      const lo = low()
      let v = el.scrollLeft
      if (v < lo) v += h
      else if (v >= lo + h) v -= h
      else return
      el.scrollLeft = pos = v
    }
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(now - last, 64) / 1000
      last = now
      if (Math.abs(el.scrollLeft - pos) > 2) {
        // Lo movió el usuario (dedo, rueda, teclado): se respeta y se espera antes de seguir.
        pos = el.scrollLeft
        holdUntil = now + RESUME_MS
      }
      if (hold || now < holdUntil || motionOff()) return
      const gap = parseFloat(getComputedStyle(el).getPropertyValue('--marquee-gap')) || 0
      const speed = ((first.offsetWidth + gap) / secondsPerCard) * (mobile.matches ? 2 : 1)
      pos += (direction === 'ltr' ? -speed : speed) * dt
      el.scrollLeft = pos
      wrap()
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(raf)
      if (!visible) return
      last = performance.now()
      pos = el.scrollLeft
      raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    el.scrollLeft = pos = low()
    const press = () => { hold++ }
    const release = () => {
      hold = Math.max(0, hold - 1)
      holdUntil = performance.now() + RESUME_MS
    }
    const enter = (e: PointerEvent) => { if (e.pointerType === 'mouse') press() }
    const leave = (e: PointerEvent) => { if (e.pointerType === 'mouse') release() }
    const onScroll = wrap
    el.addEventListener('touchstart', press, { passive: true })
    el.addEventListener('touchend', release)
    el.addEventListener('touchcancel', release)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('focusin', press)
    el.addEventListener('focusout', release)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('touchstart', press)
      el.removeEventListener('touchend', release)
      el.removeEventListener('touchcancel', release)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('focusin', press)
      el.removeEventListener('focusout', release)
      el.removeEventListener('scroll', onScroll)
    }
  }, [direction, secondsPerCard])

  return (
    <div ref={ref} className={cx('marquee', `marquee--${direction}`, className)} role="region" aria-label={label} tabIndex={0}>
      <div className="marquee__track">
        {[0, 1].map((group) => (
          <ul key={group} className="marquee__group">
            {Array.from({ length: REPEATS }, (_, copy) =>
              items.map((item, index) => {
                const hidden = group > 0 || copy > 0
                return (
                  <li
                    key={`${copy}-${index}`}
                    className="marquee__item"
                    aria-hidden={hidden || undefined}
                    inert={hidden || undefined}
                  >
                    {item}
                  </li>
                )
              }),
            )}
          </ul>
        ))}
      </div>
    </div>
  )
}
