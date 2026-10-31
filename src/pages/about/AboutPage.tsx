// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA /nosotros/ — historia, misión y visión, y equipo por áreas.
//
// • Historia: línea de tiempo vertical cuya línea se llena con el scroll (inspirada en "Growth Story Timeline" de 21st.dev).
//   Cada tarjeta entra girando desde su lado, su borde se dibuja a mano y el contenido aparece en cascada
//   (inspirado en "Sketchbook Reveal Card" de 21st.dev). Código propio: CSS animation-timeline, sin JS ni librerías.
// • Equipo: tarjetas que voltean al hacer clic, sobre la aurora del hero (ver TeamSection.tsx).
// • Fondo oscuro con las fibras de luz de GhostFibers (React Bits) detrás de toda la página (FibersBackground); los textos que van
//   directo sobre el fondo son claros y las tarjetas conservan su fondo blanco.
// • Textos → src/data/about.ts. Estilos → src/styles/pages/about.css.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, type CSSProperties } from 'react'
import { useLang } from '@/app/lang'
import { ABOUT_A11Y, ABOUT_INTRO, HISTORY, PURPOSE, VALUES, type HistoryPhoto } from '@/data/about'
import { UI } from '@/data/ui'
import { Band } from '@/components/decor/Band'
import { FibersBackground } from '@/components/decor/FibersBackground'
import { Icon } from '@/components/ui/Icon'
import { motionOff } from '@/lib/motion'
import { SoftBlurIn } from '@/pages/about/SoftBlurIn'
import { TeamSection } from '@/pages/about/TeamSection'
import { TextBlurReveal } from '@/components/ui/TextBlurReveal'

function HistoryCarousel({ photos }: { photos: HistoryPhoto[] }) {
  const lang = useLang()
  const a11y = ABOUT_A11Y[lang]
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (photos.length < 2 || paused) return
    const timer = window.setInterval(() => {
      if (!motionOff()) setActive((current) => (current + 1) % photos.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [paused, photos.length])

  return (
    <div
      className="timeline-carousel"
      role="region"
      aria-roledescription={UI[lang].carousel.role}
      aria-label={a11y.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="timeline-carousel__viewport" aria-live="off">
        {photos.map((photo, index) => (
          <img
            key={photo.src}
            className={`timeline-carousel__image${index === active ? ' is-active' : ''}`}
            src={photo.src}
            width="960"
            height="1280"
            loading="lazy"
            decoding="async"
            alt={photo.alt}
            aria-hidden={index !== active}
          />
        ))}
      </div>
      <button
        type="button"
        className="timeline-carousel__button timeline-carousel__button--prev"
        onClick={() => setActive((current) => (current - 1 + photos.length) % photos.length)}
        aria-label={a11y.prev}
      >
        <Icon name="chevronLeft" size={20} />
      </button>
      <button
        type="button"
        className="timeline-carousel__button timeline-carousel__button--next"
        onClick={() => setActive((current) => (current + 1) % photos.length)}
        aria-label={a11y.next}
      >
        <Icon name="chevronRight" size={20} />
      </button>
    </div>
  )
}

/**
 * Las fibras de fondo terminan al pie de las tarjetas de Administración (no siguen hasta el footer, que tiene sus propios
 * hilos): deja en la banda `--fibers-end`, la distancia de ese punto al final de la banda, y about.css recorta ahí.
 */
function useFibersEnd() {
  useEffect(() => {
    const band = document.querySelector<HTMLElement>('.about-page')
    const area = document.getElementById('equipo-administracion')?.closest<HTMLElement>('.team-area')
    if (!band || !area) return
    const measure = () => {
      const end = band.getBoundingClientRect().bottom - area.getBoundingClientRect().bottom
      band.style.setProperty('--fibers-end', `${Math.max(0, Math.round(end))}px`)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(band)
    observer.observe(area)
    return () => {
      observer.disconnect()
      band.style.removeProperty('--fibers-end')
    }
  }, [])
}

export function AboutPage() {
  useFibersEnd()
  const lang = useLang()
  const a11y = ABOUT_A11Y[lang]
  const intro = ABOUT_INTRO[lang]
  const history = HISTORY[lang]
  const values = VALUES[lang]
  return (
    <Band tone="night" className="about-page band--clip" labelledBy="nosotros-titulo" decor={<FibersBackground />}>
      <div className="container">
        <header>
          <p className="page-eyebrow">{intro.eyebrow}</p>
          <h1 id="nosotros-titulo" className="page-title shiny-text">
            <TextBlurReveal text={intro.title} />
          </h1>
          <p className="page-lead">{intro.lead}</p>
        </header>

        <section className="about-section" aria-labelledby="historia-titulo">
          <h2 id="historia-titulo" className="section-title">
            <SoftBlurIn>{history.title}</SoftBlurIn>
          </h2>
          <ol className="timeline" role="list">
            {history.milestones.map((item) => (
              <li key={item.label} className="timeline__item">
                <span className="timeline__dot" aria-hidden="true" />
                <div className="timeline__card">
                  {/* Borde que se "dibuja" a mano con el scroll (estilo "Sketchbook Reveal Card"). */}
                  <svg className="timeline__sketch" aria-hidden="true" focusable="false">
                    <rect pathLength={1} />
                  </svg>
                  <h3 className="timeline__title timeline__reveal" style={{ '--d': 0 } as CSSProperties}>
                    {item.label}
                  </h3>
                  <p className="timeline__text timeline__reveal" style={{ '--d': 1 } as CSSProperties}>
                    {item.text}
                  </p>
                  {item.gallery && (
                    <div className="timeline__reveal" style={{ '--d': 2 } as CSSProperties}>
                      <HistoryCarousel photos={item.gallery} />
                    </div>
                  )}
                  {item.topPhoto && (
                    <div className="timeline__reveal" style={{ '--d': 2 } as CSSProperties}>
                      <div className="timeline__photo siri">
                        <div className="timeline__frame">
                          <img className="timeline__image" src={item.topPhoto.src} width="1672" height="941" alt={item.topPhoto.alt} />
                        </div>
                      </div>
                    </div>
                  )}
                  {item.photo && (
                    <div className="timeline__reveal" style={{ '--d': 3 } as CSSProperties}>
                      <div className="timeline__photo siri">
                        <div className="timeline__frame">
                          <img className="timeline__image" src={item.photo.src} width="1672" height="941" alt={item.photo.alt} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="about-section" aria-label={a11y.purpose}>
          <ul className="purpose">
            {PURPOSE[lang].map((item) => (
              <li key={item.id} className={`purpose__card purpose__card--${item.id}`}>
                <span className="icon-badge purpose__icon siri">
                  <Icon name={item.icon} size={24} />
                </span>
                <h2 className="purpose__title">{item.title}</h2>
                <p className="purpose__text">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="about-section" aria-labelledby="valores-titulo">
          <h2 id="valores-titulo" className="section-title">
            <SoftBlurIn>{values.title}</SoftBlurIn>
          </h2>
          <ul className="values">
            {values.items.map((item) => (
              <li key={item.id} className="value-card">
                <span className="icon-badge value-card__icon siri">
                  <Icon name={item.icon} size={22} />
                </span>
                <h3 className="value-card__title">{item.title}</h3>
              </li>
            ))}
          </ul>
        </section>

        <TeamSection />
      </div>
    </Band>
  )
}
