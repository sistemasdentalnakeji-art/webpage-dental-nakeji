// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN "TESTIMONIOS" (debajo del formulario): video vertical a la izquierda y hasta 3 tarjetas de cristal a la derecha,
// cada una con una foto de archivo (≈34 % de la tarjeta).
// A propósito no se parece a "Reseñas de Google" (carrusel).
// Fondo: las partículas de prisma de Servicios destacados, en las orillas y en la franja de abajo, donde se unen con las de
// esa sección (máscaras en testimonials.css y services.css).
//
// • Testimonios, video y textos → src/data/testimonials.ts. Sin testimonios, la sección no se muestra.
// • Estilos → src/styles/pages/home/testimonials.css.
// ─────────────────────────────────────────────────────────────────────────────

import '@/styles/pages/home/testimonials.css'
import { useLang } from '@/app/lang'
import {
  TESTIMONIAL_VIDEO,
  TESTIMONIALS,
  TESTIMONIALS_SECTION,
  type Testimonial,
} from '@/data/testimonials'
import { Band } from '@/components/decor/Band'
import { ParticlesBackground } from '@/components/decor/ParticlesBackground'
import { BrandOrb } from '@/components/ui/BrandOrb'
import { SectionIntro } from '@/components/ui/SectionIntro'
import { Stars } from '@/components/ui/Stars'

const items = TESTIMONIALS.slice(0, 3)

export function Testimonials() {
  const lang = useLang()
  if (items.length === 0) return null
  const section = TESTIMONIALS_SECTION[lang]
  const showVideo = Boolean(TESTIMONIAL_VIDEO.src)

  const card = (t: Testimonial) => (
    <li className={t.photo ? 'testimonial testimonial--photo' : 'testimonial'} key={t.name + t.quote.es}>
      <figure>
        <span className="testimonial__quote-mark" aria-hidden="true">
          “
        </span>
        <blockquote lang={lang}>
          <p>{t.quote[lang]}</p>
        </blockquote>
        <figcaption>
          <span className="testimonial__logo">
            <BrandOrb lazy />
          </span>
          <span className="testimonial__who">
            <strong>{t.name}</strong>
            <span className="testimonial__meta">
              {t.rating !== null && <Stars rating={t.rating} size={16} />}
              {t.treatment && <span>{t.treatment[lang]}</span>}
            </span>
          </span>
        </figcaption>
      </figure>
      {t.photo && (
        <div className="testimonial__photo">
          <img src={t.photo.src} alt={t.photo.alt[lang]} width={560} height={700} loading="lazy" decoding="async" />
        </div>
      )}
    </li>
  )

  return (
    <Band tone="white" className="testimonials-band" labelledBy="testimonios-titulo" decor={<ParticlesBackground density={200} max={280} />}>
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
      </div>
    </Band>
  )
}
