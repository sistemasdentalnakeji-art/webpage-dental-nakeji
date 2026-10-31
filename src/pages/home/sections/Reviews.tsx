// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN "RESEÑAS DE GOOGLE": resumen de calificación + carrusel de reseñas.
//
// • Reseñas reales → api/reviews.ts (Google Places) vía src/lib/useGoogleReviews.ts; tipos en src/data/reviews.ts.
// • Título y texto → src/data/home.ts (REVIEWS_SECTION).
// • Estilos → src/styles/pages/home/reviews.css.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useLang } from '@/app/lang'
import { REVIEWS_SUMMARY, type Review } from '@/data/reviews'
import { SITE } from '@/config/site'
import { UI } from '@/data/ui'
import { REVIEWS_SECTION } from '@/data/home'
import { Marquee } from '@/components/ui/Marquee'
import { Band } from '@/components/decor/Band'
import { SectionDecor } from '@/components/decor/SectionDecor'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Stars } from '@/components/ui/Stars'
import { useGoogleReviews } from '@/lib/useGoogleReviews'

const GOOGLE_LETTERS = ['G', 'o', 'o', 'g', 'l', 'e'] as const
const GOOGLE_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335']

function GoogleBrand() {
  const ref = useRef<HTMLSpanElement>(null)
  const [play, setPlay] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setPlay(true); obs.disconnect() } },
      { threshold: 0.6 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <span ref={ref} className={`google-brand${play ? ' google-brand--play' : ''}`} aria-hidden="true">
      {GOOGLE_LETTERS.map((letter, i) => (
        <span
          key={i}
          className="google-brand__letter"
          style={{ '--i': i, '--gc': GOOGLE_COLORS[i] } as CSSProperties}
        >
          {letter}
        </span>
      ))}
    </span>
  )
}

/** La "G" oficial de Google en sus cuatro colores. */
function GoogleG({ size }: { size: number }) {
  return (
    <svg className="google-g" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

/** Tarjeta oscura; el recuadro del autor lleva un punto de luz que le da la vuelta al contorno (--i desfasa cada tarjeta). */
function ReviewCard({ review, more, index }: { review: Review; more: string; index: number }) {
  const initial = review.author.trim().charAt(0).toUpperCase()
  return (
    <article className="review-card" style={{ '--i': index } as CSSProperties}>
      <div className="review-card__top">
        <GoogleG size={22} />
      </div>
      <div className="review-card__author">
        {review.photoUrl ? (
          <img
            className="review-card__avatar"
            src={review.photoUrl}
            width={48}
            height={48}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="review-card__avatar" aria-hidden="true">
            {initial}
          </span>
        )}
        <div className="review-card__who">
          <h3 className="review-card__name">
            {review.authorUrl ? (
              <ExternalLink href={review.authorUrl}>{review.author}</ExternalLink>
            ) : (
              review.author
            )}
          </h3>
          <Stars rating={review.rating} size={14} />
          <p className="review-card__time">{review.relativeTime}</p>
        </div>
      </div>
      <p className="review-card__text">{review.text}</p>
      {review.googleUrl && (
        <ExternalLink className="review-card__more" href={review.googleUrl}>
          {more}
        </ExternalLink>
      )}
    </article>
  )
}

export function Reviews() {
  const lang = useLang()
  const ui = UI[lang].reviews
  const section = REVIEWS_SECTION[lang]
  const live = useGoogleReviews(lang)
  const { profileUrl } = REVIEWS_SUMMARY
  const domain = new URL(SITE.origin).host.replace(/^www\./, '')
  // Cuatro tarjetas: con seis la sección se vuelve pesada en celular. Sin reseñas reales (HTML prerenderizado, desarrollo)
  // no hay carrusel: así Google nunca indexa tarjetas de ejemplo.
  const cards = (live?.reviews ?? []).slice(0, 4).map((review, index) => (
    <ReviewCard review={review} more={ui.more} index={index} />
  ))
  // La segunda fila arranca por otra tarjeta para que, con pocas reseñas, las dos filas no se vean iguales.
  const shift = Math.ceil(cards.length / 2)
  const cardsBottom = [...cards.slice(shift), ...cards.slice(0, shift)]
  return (
    <Band tone="tint" className="reviews-band" labelledBy="resenas-titulo" decor={<SectionDecor variant="rings" placement="reviews" />}>
      <div className="container">
        <div className="reviews-intro">
          <div className="reviews-intro__google">
            <GoogleBrand />
            <h2 id="resenas-titulo" className="visually-hidden">
              {section.title}
            </h2>
          </div>

          <div className="mac-window">
            <div className="mac-window__bar">
              <span className="mac-window__dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="mac-window__url">{domain}</span>
            </div>
            <div className="mac-window__body">
              <div className="mac-window__scene">
                <p className="mac-window__slogan">{section.slogan}</p>
                <p className="mac-window__sub">{section.sloganSub}</p>
                <div className="mac-window__action">
                  <ExternalLink className="mac-window__btn" href={profileUrl}>
                    {section.cta}
                  </ExternalLink>
                  <svg className="mac-window__cursor" width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 3l14 7-6 2-2 6z" fill="#fff" stroke="#0b1220" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="mac-window__stars" aria-hidden="true">
                  <Stars rating={null} size={26} />
                  <span className="mac-window__stars-fill">
                    <Stars rating={5} size={26} />
                  </span>
                </div>
              </div>
              <div
                className="logo mac-window__brand"
                aria-hidden="true"
                style={{ '--logo-mask': `url(${SITE.logo.src})` } as CSSProperties}
              >
                <span className="logo__word logo__word--left" />
                <span className="logo__orb siri">
                  <img className="logo__mark" src="/favicon-192.webp" width={192} height={192} alt="" decoding="async" />
                </span>
                <span className="logo__word logo__word--right" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {cards.length > 0 && (
        <div className="reviews-rows">
          {/* Despacio, para alcanzar a leer cada reseña antes de que salga. */}
          <Marquee label={ui.carousel} items={cards} direction="ltr" secondsPerCard={22} />
          <Marquee label={ui.carousel} items={cardsBottom} direction="rtl" secondsPerCard={26} />
        </div>
      )}
    </Band>
  )
}
