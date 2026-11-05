// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN "TESTIMONIOS" (debajo del formulario): dos paneles tipo acordeón horizontal, uno junto al otro.
//   • Izquierda: los videos de pacientes. • Derecha: las reseñas (foto + cita).
// En cada panel solo una tarjeta está abierta; las demás quedan como tiras con su foto/portada, nombre y "+" (o "▶").
// Al tocar otra, se abre y la anterior se guarda. Inspirado en "pastel-testimonial-section" (21st.dev).
// Fondo: las partículas de prisma de Servicios destacados (máscaras en testimonials.css y services.css).
//
// Accesibilidad (patrón acordeón APG): cada tarjeta es un <h3><button aria-expanded>; en la abierta el botón es la "×" y la cierra
// (con todas cerradas, las tiras llenan el panel). Las flechas del teclado mueven el foco entre encabezados sin abrir; Enter/Espacio abre.
// No se capturan teclas dentro del <video>. Al cambiar de tarjeta se pausa el video que se cierra. Nada se reproduce solo.
//
// • Reseñas, videos y textos → src/data/testimonials.ts. Sin reseñas ni videos, la sección no se muestra.
// • Estilos → src/styles/pages/home/testimonials.css.
// ─────────────────────────────────────────────────────────────────────────────

import '@/styles/pages/home/testimonials.css'
import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import { useLang } from '@/app/lang'
import { TESTIMONIAL_VIDEOS, TESTIMONIALS, TESTIMONIALS_SECTION, type Testimonial } from '@/data/testimonials'
import { Band } from '@/components/decor/Band'
import { ParticlesBackground } from '@/components/decor/ParticlesBackground'
import { BrandOrb } from '@/components/ui/BrandOrb'
import { Icon } from '@/components/ui/Icon'
import { SectionIntro } from '@/components/ui/SectionIntro'
import { Stars } from '@/components/ui/Stars'
import { motionOff } from '@/lib/motion'

type Slide =
  | { kind: 'review'; id: string; name: string; t: Testimonial }
  | { kind: 'video'; id: string; name: string; v: (typeof TESTIMONIAL_VIDEOS)[number] }

const VIDEOS: Slide[] = TESTIMONIAL_VIDEOS.slice(0, 5).map((v, i) => ({ kind: 'video', id: `v${i}`, name: v.name, v }))
const REVIEWS: Slide[] = TESTIMONIALS.slice(0, 4).map((t, i) => ({ kind: 'review', id: `r${i}`, name: t.name, t }))


// Celular: una tarjeta a la vez, deslizable (scroll-snap), con chips de navegación debajo.
const MOBILE_Q = '(max-width: 699.98px)'
const subscribeMobile = (cb: () => void) => {
  const mq = window.matchMedia(MOBILE_Q)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const useIsMobile = () =>
  useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_Q).matches,
    () => false,
  )

/** Un panel acordeón: fila de tarjetas con una abierta. */
function Row({ slides, label, variant }: { slides: Slide[]; label: string; variant: 'videos' | 'reviews' }) {
  const lang = useLang()
  const uid = useId()
  const [open, setOpen] = useState(0) // -1 = todas cerradas (botón X)
  const mobile = useIsMobile()
  const settle = useRef(0)
  const trackRef = useRef<HTMLUListElement>(null)
  const headRefs = useRef<(HTMLButtonElement | null)[]>([])

  // La tarjeta abierta queda a la vista (en celular, centrada en la fila deslizable).
  useEffect(() => {
    // Solo desplaza la fila (scrollIntoView movía también la página: al cargar saltaba a Testimoniales).
    const li = headRefs.current[open]?.closest('li')
    const track = trackRef.current
    if (!li || !track || track.scrollWidth <= track.clientWidth) return
    const x = li.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft
    const left = mobile
      ? x - (track.clientWidth - li.offsetWidth) / 2
      : Math.min(x, Math.max(track.scrollLeft, x + li.offsetWidth - track.clientWidth))
    track.scrollTo({ left, behavior: motionOff() ? 'auto' : 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al cambiar la tarjeta abierta; `mobile` no debe mover el scroll
  }, [open])

  useEffect(() => () => window.clearTimeout(settle.current), [])

  if (slides.length === 0) return null

  const select = (i: number) => {
    // Con `hidden` el audio puede seguir: se pausa explícitamente el video que se guarda.
    trackRef.current?.querySelectorAll('video').forEach((v) => v.pause())
    setOpen(i)
  }

  // Celular: al terminar de deslizar, la tarjeta más centrada pasa a ser la activa (y se pausa el video que salió).
  const onTrackScroll = () => {
    if (!mobile) return
    window.clearTimeout(settle.current)
    settle.current = window.setTimeout(() => {
      const track = trackRef.current
      if (!track) return
      const mid = track.scrollLeft + track.clientWidth / 2
      let best = 0
      let dist = Infinity
      Array.from(track.children).forEach((el, i) => {
        const d = Math.abs((el as HTMLElement).offsetLeft + (el as HTMLElement).offsetWidth / 2 - mid)
        if (d < dist) {
          best = i
          dist = d
        }
      })
      if (best !== open) select(best)
    }, 120)
  }

  // Teclado solo en los encabezados (no en el contenedor): así no se roban teclas a los controles del video.
  const onHeadKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: slides.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    headRefs.current[(next + slides.length) % slides.length]?.focus()
  }

  return (
    <div className={`tpanel tpanel--${variant}${open < 0 && !mobile ? ' is-collapsed' : ''}`} role="group" aria-label={label}>
      <ul ref={trackRef} className="tpanel__track" onScroll={onTrackScroll}>
        {slides.map((s, i) => {
          const isOpen = i === open
          const shown = mobile || isOpen // en celular todas se ven abiertas (una por pantalla)
          const panelId = `${uid}-${s.id}`
          const photo = s.kind === 'review' ? s.t.photo : undefined
          return (
            <li key={s.id} className={`tcard tcard--${s.kind}${shown ? ' is-open' : ''}`}>
              {/* Portada: la foto de la reseña o el propio video (el mismo elemento abierto y cerrado: no se reinicia). */}
              <div className="tcard__cover" aria-hidden={s.kind === 'review' || !shown}>
                {photo && <img src={photo.src} alt="" width={560} height={700} loading="lazy" decoding="async" />}
                {s.kind === 'video' && (
                  <video
                    playsInline
                    preload="metadata"
                    controls={shown}
                    tabIndex={shown ? 0 : -1}
                    aria-label={s.v.label[lang]}
                    src={`${s.v.src}#t=0.1`}
                  />
                )}
              </div>

              <h3 className="tcard__head">
                <button
                  ref={(node) => {
                    headRefs.current[i] = node
                  }}
                  type="button"
                  className="tcard__toggle"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  // Abierta: el mismo botón es la "×" y cierra la tarjeta (las de este panel quedan como tiras).
                  onClick={() => select(isOpen ? -1 : i)}
                  onKeyDown={(e) => onHeadKey(e, i)}
                >
                  <span className="tcard__plus" aria-hidden="true">
                    {s.kind === 'video' && <Icon name="play" size={16} />}
                  </span>
                  {/* Nombre corto visible; el nombre accesible empieza igual (WCAG 2.5.3) y agrega "video". */}
                  <span className="tcard__name">
                    {s.name}
                    {s.kind === 'video' && <span className="visually-hidden"> ({s.v.label[lang]})</span>}
                  </span>
                </button>
              </h3>

              <div id={panelId} className="tcard__panel" hidden={!shown || s.kind === 'video'}>
                {s.kind === 'review' && (
                  // Orden: nombre y estrellas arriba, línea, cita centrada (con la comilla dorada), línea y el logo iluminado abajo.
                  <figure className="tcard__review">
                    <figcaption className="tcard__who">
                      <strong>{s.t.name}</strong>
                      <span className="tcard__meta">
                        {s.t.rating !== null && <Stars rating={s.t.rating} size={18} />}
                      </span>
                    </figcaption>
                    <blockquote lang={lang}>
                      <span className="tcard__quote-mark" aria-hidden="true">
                        “
                      </span>
                      <p>{s.t.quote[lang]}</p>
                    </blockquote>
                    <span className="tcard__logo">
                      <BrandOrb lazy />
                    </span>
                  </figure>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {mobile && (
        <div className="tchips" role="group" aria-label={label}>
          {slides.map((s, i) => (
            <button key={s.id} type="button" className="tchip" aria-pressed={i === open} onClick={() => i !== open && select(i)}>
              <span className="tchip__thumb" aria-hidden="true">
                {s.kind === 'review' && s.t.photo && <img src={s.t.photo.src} alt="" width={44} height={44} loading="lazy" decoding="async" />}
                {s.kind === 'video' && <video muted playsInline preload="metadata" tabIndex={-1} src={`${s.v.src}#t=0.1`} />}
              </span>
              {/* Visible: solo el nombre de pila (cabe en el chip); el nombre completo va para lectores de pantalla. */}
              <span className="tchip__name">
                <span aria-hidden="true">{s.name.split(' ')[0]}</span>
                <span className="visually-hidden">{s.kind === 'video' ? s.v.label[lang] : s.name}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Testimonials() {
  const lang = useLang()
  const section = TESTIMONIALS_SECTION[lang]
  if (VIDEOS.length + REVIEWS.length === 0) return null

  return (
    <Band tone="white" className="testimonials-band" labelledBy="testimonios-titulo" decor={<ParticlesBackground density={150} max={180} />}>
      <div className="container">
        <div className="testimonials-intro">
          <SectionIntro icon="message" id="testimonios-titulo" title={section.title} text={section.text} />
        </div>
        <div className="tpanels">
          <Row slides={VIDEOS} label={section.video} variant="videos" />
          <Row slides={REVIEWS} label={section.list} variant="reviews" />
        </div>
      </div>
    </Band>
  )
}
