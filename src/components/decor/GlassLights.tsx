// Manchas de luz difusas fijas detrás del contenido: dan color al vidrio de las tarjetas (backdrop-filter).
// Van dentro de .home-canvas (isolation), encima del degradado de página. Estilos → styles/components/glass-lights.css.
// • La luz dorada nunca baja del footer: un rAF en scroll (passive) mide dónde empieza el footer y recorta lo que lo invade.
import { useEffect, useRef } from 'react'

/** `gold="none"`: sin la mancha dorada (homepage, y las páginas donde la dorada la pone PagePlasma). */
export function GlassLights({ gold = 'blob', sides = true }: { gold?: 'blob' | 'none'; sides?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const draw = () => {
      raf = 0
      const footer = document.querySelector('.site-footer')
      const clip = footer ? Math.max(0, innerHeight - footer.getBoundingClientRect().top) : 0
      el.style.setProperty('--gl-clip', `${clip}px`)
    }
    const onScroll = () => (raf ||= requestAnimationFrame(draw))
    draw()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll, { passive: true })
    addEventListener('motionchange', onScroll)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      removeEventListener('motionchange', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={ref} className="glass-lights" aria-hidden="true">
      {sides && <span className="glass-lights__blob glass-lights__blob--sky" />}
      {sides && <span className="glass-lights__blob glass-lights__blob--brand" />}
      <div className="glass-lights__gold">
        {gold === 'blob' && <span className="glass-lights__blob glass-lights__blob--gold" />}
      </div>
    </div>
  )
}
