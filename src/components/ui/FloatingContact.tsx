// ─────────────────────────────────────────────────────────────────────────────
// BOTONES FLOTANTES (abajo a la derecha, en todas las páginas):
//   • Arriba: el logo de Nakeji en su orbe con un aro de progreso que se LLENA al bajar por la página (en lugar de la barra
//     de arriba). Al tocarlo, vuelve al inicio.
//   • Arriba de todo: botón pequeño de vidrio para pausar/reanudar las animaciones (centro de mando).
//   • Abajo: WhatsApp (abre el chat de la clínica). Al llegar a la página aparece un globito ("¿Buscas un servicio? ¡Escríbenos!")
//     que se puede cerrar y que se esconde solo a los pocos segundos (una vez por visita).
// Estilos → src/styles/components/floating-contact.css.
// ─────────────────────────────────────────────────────────────────────────────

import '@/styles/components/floating-contact.css'
import { useEffect, useRef, useState } from 'react'
import { useLang } from '@/app/lang'
import { SITE } from '@/config/site'
import { Icon } from '@/components/ui/Icon'
import { motionOff, setMotionPaused } from '@/lib/motion'

const TEXT = {
  es: { bubble: '¿Buscas un servicio? 🦷', cta: '¡Escríbenos por WhatsApp!', close: 'Cerrar aviso', wa: 'Escríbenos por WhatsApp', top: 'Volver al inicio', pause: 'Pausar animaciones', paused: 'Reanudar animaciones' },
  en: { bubble: 'Looking for a treatment? 🦷', cta: 'Message us on WhatsApp!', close: 'Close notice', wa: 'Message us on WhatsApp', top: 'Back to top', pause: 'Pause animations', paused: 'Resume animations' },
}

const R = 27 // radio del aro de progreso (viewBox 60×60)
const C = 2 * Math.PI * R

export function FloatingContact() {
  const t = TEXT[useLang()]
  const ringRef = useRef<SVGCircleElement>(null)
  const [bubble, setBubble] = useState(false)
  const [paused, setPaused] = useState(false)

  // Se mantiene al día si otro control (el del footer) pausa o reanuda.
  useEffect(() => {
    const sync = () => setPaused(document.documentElement.dataset.motion === 'paused')
    sync()
    addEventListener('motionchange', sync)
    return () => removeEventListener('motionchange', sync)
  }, [])

  // Progreso de lectura: el aro azul→oro se llena con el scroll.
  useEffect(() => {
    let raf = 0
    const draw = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - innerHeight
      const p = max > 0 ? Math.min(1, scrollY / max) : 0
      ringRef.current?.style.setProperty('stroke-dashoffset', String(C * (1 - p)))
    }
    const onScroll = () => (raf ||= requestAnimationFrame(draw))
    draw()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll, { passive: true })
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // El globito aparece a los 2.5 s de llegar y se va solo a los 11.5 s (una vez por visita).
  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem('nakeji-wa-bubble') === '1'
    } catch {
      /* almacenamiento bloqueado: se muestra igual */
    }
    if (seen) return
    // La marca se guarda al mostrarse (no antes): así un efecto que se monta dos veces no lo cancela.
    const show = window.setTimeout(() => {
      setBubble(true)
      try {
        sessionStorage.setItem('nakeji-wa-bubble', '1')
      } catch {
        /* sin almacenamiento */
      }
    }, 2500)
    const hide = window.setTimeout(() => setBubble(false), 11500)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [])

  return (
    <div className="float-contact">
      <button
        type="button"
        className="float-contact__pause"
        aria-label={t.pause}
        aria-pressed={paused}
        title={paused ? t.paused : t.pause}
        onClick={() => setMotionPaused(!paused)}
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
          {paused ? <path d="M8 5.5v13l11-6.5z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}
        </svg>
      </button>

      <button
        type="button"
        className="float-contact__top"
        aria-label={t.top}
        onClick={() => scrollTo({ top: 0, behavior: motionOff() ? 'auto' : 'smooth' })}
      >
        <svg className="float-contact__ring" viewBox="0 0 60 60" aria-hidden="true">
          <defs>
            <linearGradient id="float-progress" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7bc3eb" />
              <stop offset="1" stopColor="#e0b65c" />
            </linearGradient>
          </defs>
          <circle className="float-contact__track" cx="30" cy="30" r={R} />
          <circle ref={ringRef} className="float-contact__fill" cx="30" cy="30" r={R} strokeDasharray={C} strokeDashoffset={C} />
        </svg>
        <img className="float-contact__logo" src="/favicon-192.webp" width={30} height={30} alt="" decoding="async" />
      </button>

      <div className="float-contact__wa-wrap">
        {bubble && (
          <div className="float-contact__bubble" role="status">
            <button type="button" className="float-contact__close" aria-label={t.close} onClick={() => setBubble(false)}>
              <Icon name="close" size={14} />
            </button>
            <strong>{t.bubble}</strong>
            <span>{t.cta}</span>
          </div>
        )}
        <a className="float-contact__wa" href={SITE.social.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={t.wa}>
          <Icon name="whatsapp" size={26} />
        </a>
      </div>
    </div>
  )
}
