// Efectos activos con el puntero (solo escritorio con ratón): luz de tarjetas (--mx/--my/--glow), inclinación 3D mínima e imán del CTA.
// Un solo listener delegado en document. Solo se llama desde un efecto (en Node no hay window). Devuelve la limpieza.
import { motionOff } from '@/lib/motion'

const CARDS = '.tcard, .catalog-card, .service-card, .card, .contact-card, .benefit-card__top, .schedule__form, .legal-card, .before-after, .home-canvas .rail, .promo, .timeline__card, .purpose__card, .value-card, .home-canvas .contact-item'
const TILT = '.catalog-card, .service-card'
const MAGNET = '.hero__cta, .service-hero__cta, .schedule-link--bar'
const MAX_DEG = 3
const MAX_PULL = 6
const RADIUS = 80
const EASE = '0.3s cubic-bezier(0.22, 1, 0.36, 1)'

// El transition existente se conserva y se le suma la propiedad animada (así no se pisan los hovers del CSS).
const withTransition = (el: HTMLElement, prop: string) => {
  if (el.dataset.fx) return
  el.dataset.fx = '1'
  el.style.transition = `${getComputedStyle(el).transition}, ${prop} ${EASE}`
}

export function initPointerGlow(): () => void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {}

  let card: HTMLElement | null = null
  let tilted: HTMLElement | null = null
  let ev: PointerEvent | null = null
  let raf = 0
  const magnets = new Map<HTMLElement, boolean>()
  const tiltable = new WeakMap<HTMLElement, boolean>()

  const setGlow = (el: HTMLElement | null, v: 0 | 1) => el?.style.setProperty('--glow', String(v))
  const untilt = () => {
    if (tilted) tilted.style.rotate = ''
    tilted = null
  }
  const unmagnet = () => magnets.forEach((_, el) => (el.style.translate = ''))

  const frame = () => {
    raf = 0
    if (!ev) return
    const { clientX: x, clientY: y, target } = ev
    const next = target instanceof Element ? target.closest<HTMLElement>(CARDS) : null
    if (next !== card) {
      setGlow(card, 0)
      card = next
    }
    if (card) {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${Math.round(x - r.left)}px`)
      card.style.setProperty('--my', `${Math.round(y - r.top)}px`)
      setGlow(card, 1)
    }

    const off = motionOff()
    const t = !off && target instanceof Element ? target.closest<HTMLElement>(TILT) : null
    if (t !== tilted) untilt()
    if (t) {
      let ok = tiltable.get(t)
      if (ok === undefined) {
        ok = getComputedStyle(t).rotate === 'none' // si ya tiene rotate propio, no se toca
        tiltable.set(t, ok)
        if (ok) withTransition(t, 'rotate')
      }
      if (ok) {
        const r = t.getBoundingClientRect()
        const px = (x - r.left) / r.width - 0.5
        const py = (y - r.top) / r.height - 0.5
        // Eje-ángulo en la propiedad individual `rotate`: se suma al transform del hover (p. ej. translateY) sin pisarlo.
        t.style.rotate = `${-py} ${px} 0 ${Math.min(MAX_DEG, 2 * MAX_DEG * Math.hypot(px, py)).toFixed(2)}deg`
        tilted = t
      }
    }

    for (const el of document.querySelectorAll<HTMLElement>(MAGNET)) {
      const r = el.getBoundingClientRect()
      const dx = x - (r.left + r.width / 2)
      const dy = y - (r.top + r.height / 2)
      const dist = Math.hypot(dx, dy)
      // Distancia al borde del botón, no a su centro: así "a menos de 80px" es intuitivo.
      const edge = Math.max(0, Math.abs(dx) - r.width / 2) + Math.max(0, Math.abs(dy) - r.height / 2)
      if (off || edge >= RADIUS || !dist) {
        if (magnets.has(el)) el.style.translate = ''
        continue
      }
      if (!magnets.has(el)) {
        magnets.set(el, true)
        withTransition(el, 'translate')
      }
      const k = (MAX_PULL * (1 - edge / RADIUS)) / dist
      el.style.translate = `${(dx * Math.min(k, 1)).toFixed(2)}px ${(dy * Math.min(k, 1)).toFixed(2)}px`
    }
  }

  const move = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    ev = e
    raf ||= requestAnimationFrame(frame)
  }
  const leave = () => {
    ev = null
    setGlow(card, 0)
    card = null
    untilt()
    unmagnet()
  }
  const sync = () => motionOff() && (untilt(), unmagnet())

  document.addEventListener('pointermove', move, { passive: true })
  document.documentElement.addEventListener('pointerleave', leave, { passive: true })
  window.addEventListener('motionchange', sync)
  return () => {
    document.removeEventListener('pointermove', move)
    document.documentElement.removeEventListener('pointerleave', leave)
    window.removeEventListener('motionchange', sync)
    cancelAnimationFrame(raf)
    leave()
  }
}
