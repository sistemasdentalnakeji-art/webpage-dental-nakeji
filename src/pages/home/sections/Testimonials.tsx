// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN "TESTIMONIOS" (debajo del formulario): video vertical a la izquierda y hasta 3 tarjetas de cristal a la derecha.
// A propósito no se parece a "Reseñas de Google" (carrusel).
//
// • Testimonios, video y textos → src/data/testimonials.ts. Sin testimonios, la sección no se muestra.
// • Estilos → src/styles/pages/home/testimonials.css.
// ─────────────────────────────────────────────────────────────────────────────

import '@/styles/pages/home/testimonials.css'
import { useLang } from '@/app/lang'
import {
  TESTIMONIAL_VIDEO,
  TESTIMONIALS,
  TESTIMONIALS_GOOGLE_URL,
  TESTIMONIALS_SECTION,
  type Testimonial,
} from '@/data/testimonials'
import { Band } from '@/components/decor/Band'
import { SectionIntro } from '@/components/ui/SectionIntro'
import { Stars } from '@/components/ui/Stars'

/** Dos iniciales del nombre para el avatar. */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

const items = TESTIMONIALS.slice(0, 3)

export function Testimonials() {
  const lang = useLang()
  if (items.length === 0) return null
  const section = TESTIMONIALS_SECTION[lang]
  const showVideo = Boolean(TESTIMONIAL_VIDEO.src)

  const card = (t: Testimonial) => (
    <li className="testimonial" key={t.name + t.quote.es}>
      <figure>
        <span className="testimonial__quote-mark" aria-hidden="true">
          “
        </span>
        <blockquote lang={lang}>
          <p>{t.quote[lang]}</p>
        </blockquote>
        <figcaption>
          <span className="testimonial__avatar" aria-hidden="true">
            {initials(t.name)}
          </span>
          <span className="testimonial__who">
            <strong>{t.name}</strong>
            <span>{[t.source === 'google' && section.googleReview, t.treatment?.[lang]].filter(Boolean).join(' · ')}</span>
          </span>
          {t.rating !== null && <Stars rating={t.rating} size={15} />}
        </figcaption>
      </figure>
    </li>
  )

  return (
    <Band tone="white" className="testimonials-band" labelledBy="testimonios-titulo">
      <div className="container">
        <div className="testimonials-intro">
          <SectionIntro icon="message" id="testimonios-titulo" title={section.title} text={section.text} />
        </div>
        <div className={showVideo ? 'testimonials-layout' : 'testimonials-layout testimonials-layout--cards'}>
          {showVideo && (
            <div className="testimonial-video">
              <video controls playsInline preload="metadata" aria-label={section.video} src={TESTIMONIAL_VIDEO.src} />
            </div>
          )}
          <ul className="testimonials" aria-label={section.list}>
            {items.map(card)}
          </ul>
        </div>
        <p className="testimonials-more">
          <a href={TESTIMONIALS_GOOGLE_URL} target="_blank" rel="noopener noreferrer">
            {section.seeAll}
          </a>
        </p>
      </div>
    </Band>
  )
}
