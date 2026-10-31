// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA /contacto/ — "Ficha de la clínica": una tarjeta con los datos para escribir o llamar (teléfonos y correo), una franja
// de WhatsApp (la acción principal) y la ubicación con el plano animado; debajo, el muro de redes.
//
// • El plano es el mismo LocationMap de la home (se abre solo al verse).
// • Las tarjetas entran con el scroll (CSS animation-timeline, sin JS); sin soporte se ven quietas.
// • Sin fondo propio. Textos → src/data/contact.ts; datos de contacto → src/config/site.ts.
// • Redes ("muro"): panel oscuro con texto y enlaces a la izquierda y dos ventanas a la derecha con el contenido real,
//   que se carga solo (iframes con loading="lazy"): plugin de página de Facebook e incrustación del perfil de Instagram.
// • Estilos → src/styles/pages/contact.css.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLang } from '@/app/lang'
import { SITE } from '@/config/site'
import {
  CONTACT_A11Y,
  CONTACT_DIRECT,
  CONTACT_INTRO,
  CONTACT_SOCIAL,
  facebookEmbed,
  INSTAGRAM_EMBED,
  PRIVACY_NOTE,
  SOCIAL_CARDS,
} from '@/data/contact'
import { UI } from '@/data/ui'
import { Band } from '@/components/decor/Band'
import { PagePlasma } from '@/components/decor/PagePlasma'
import { AddressText } from '@/components/ui/AddressText'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { InteractiveHoverContent } from '@/components/ui/AnimatedButtons'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Icon, type IconName } from '@/components/ui/Icon'
import { LocationMap } from '@/components/ui/LocationMap'
import { cx } from '@/lib/cx'
import { TextBlurReveal } from '@/components/ui/TextBlurReveal'

// Bloque de la ficha: icono + título y su contenido.
function Group({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return (
    <div className="contact-group">
      <div className="contact-group__head">
        <span className="contact-group__icon">
          <Icon name={icon} size={20} />
        </span>
        <h2 className="contact-group__title">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// Copia al portapapeles (solo en el navegador, dentro del clic); confirma 1.6 s con una palomita.
function CopyButton({ text, label }: { text: string; label: string }) {
  const a11y = CONTACT_A11Y[useLang()]
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = () => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true)
        // Un segundo clic reinicia la cuenta (si no, el primer temporizador cortaría la confirmación).
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), 1600)
      })
      .catch(() => undefined)
  }
  return (
    <>
      <button type="button" className="copy-btn" onClick={copy} aria-label={a11y.copy(label)}>
        {copied ? (
          <Icon name="check" size={16} />
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="11" height="11" rx="2.5" />
            <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
          </svg>
        )}
      </button>
      {/* Fuera del botón: el contenido de un botón es presentacional y su aria-label lo taparía; así sí se anuncia. */}
      <span className="copy-btn__live" role="status">
        {copied ? a11y.copied : ''}
      </span>
    </>
  )
}

// Ventana de red social: barra con marca y "en vivo", y el contenido incrustado (se carga solo, en diferido).
// `src` como función recibe el ancho del iframe ya medido en el navegador (Facebook); así el prerender no lo necesita.
// Se vuelve a medir si el ancho cambia (girar el teléfono, cambiar la ventana): el plugin de Facebook no se adapta solo.
function SocialWindow({ brand, src, title }: { brand: 'facebook' | 'instagram'; src: string | ((width: number) => string); title: string }) {
  const card = SOCIAL_CARDS[useLang()][brand]
  const frameRef = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    const frame = frameRef.current
    if (!frame || typeof src !== 'function') return
    let width = 0
    let timer = 0
    const load = () => {
      const next = Math.round(frame.getBoundingClientRect().width)
      if (Math.abs(next - width) < 40) return // cambios mínimos (barra de scroll) no recargan el plugin
      width = next
      frame.src = src(next)
    }
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(load, 250)
    })
    observer.observe(frame)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [src])
  return (
    <article className={cx('social-window', `social-window--${brand}`)}>
      <header className="social-window__bar">
        <BrandIcon name={brand} size={22} />
        <h3 className="social-window__title">{card.title}</h3>
        <span className="social-window__handle">{card.handle}</span>
        <span className="social-window__live" aria-hidden="true" />
      </header>
      <iframe
        className="social-window__embed"
        src={typeof src === 'string' ? src : undefined}
        ref={frameRef}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <ExternalLink className="social-window__more" href={SITE.social[brand]}>
        {card.more}
        <Icon name="arrowRight" size={16} />
      </ExternalLink>
    </article>
  )
}

export function ContactPage() {
  const lang = useLang()
  const intro = CONTACT_INTRO[lang]
  const direct = CONTACT_DIRECT[lang]
  const social = CONTACT_SOCIAL[lang]
  const a11y = CONTACT_A11Y[lang]
  return (
    <Band
      tone="gradient"
      className="contact-page band--clip"
      labelledBy="contacto-titulo"
      decor={<PagePlasma />}
    >
      <div className="container">
        <header>
          <p className="page-eyebrow pill-label">{intro.eyebrow}</p>
          <h1 id="contacto-titulo" className="page-title shiny-text">
            <TextBlurReveal text={intro.title} />
          </h1>
          <p className="page-lead">{intro.tagline}</p>
        </header>

        <section className="contact-page__section contact-sheet" aria-label={a11y.sections}>
          <div className="contact-card contact-card--directory">
            <Group icon="phone" title={direct.phoneLabel}>
              <div className="bento__phones">
                {SITE.phones.map((phone) => (
                  <div key={phone.e164} className="bento__phone">
                    <span className="bento__label">{phone.labels[lang]}</span>
                    <div className="bento__row">
                      <a className="bento__value" href={phone.href}>
                        {phone.displays[lang]}
                      </a>
                      <CopyButton text={phone.displays[lang]} label={phone.labels[lang]} />
                    </div>
                  </div>
                ))}
              </div>
            </Group>

            <Group icon="mail" title={direct.emailLabel}>
              <div className="bento__row">
                <a className="bento__value bento__value--mail" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
                <CopyButton text={SITE.email} label={direct.emailLabel} />
              </div>
              <p className="bento__note">{direct.emailText}</p>
              {SITE.hours.length > 0 && (
                <ul className="bento__hours">
                  {SITE.hours.map((row) => (
                    <li key={row.days}>
                      <Icon name="clock" size={16} /> {row.days}: {row.hours}
                    </li>
                  ))}
                </ul>
              )}
              <a className="btn btn--primary btn--sm bento__mail-cta interactive-hover" href={`mailto:${SITE.email}`}>
                <InteractiveHoverContent>{direct.emailCta}</InteractiveHoverContent>
              </a>
            </Group>
          </div>

          <div className="contact-card contact-wa">
            <div className="contact-wa__body">
              <div className="contact-group__head">
                <BrandIcon name="whatsapp" size={40} />
                <h2 className="contact-group__title">{direct.whatsappTitle}</h2>
                {/* Burbuja de "escribiendo…" como la de WhatsApp (decorativa). */}
                <span className="bento__typing" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <p className="bento__copy">{direct.whatsappText}</p>
            </div>
            <ExternalLink className="btn bento__wa" href={SITE.social.whatsapp}>
              <Icon name="whatsapp" size={20} />
              {direct.whatsappCta}
            </ExternalLink>
          </div>

          <div className="contact-card contact-map">
            <div className="contact-group__head">
              <span className="contact-group__icon">
                <Icon name="pin" size={20} />
              </span>
              <h2 className="contact-group__title">{direct.addressLabel}</h2>
            </div>
            <div className="bento__map">
              <LocationMap name={SITE.name} tag={UI[lang].map.tag} />
            </div>
            <div className="bento__row bento__row--address">
              <address className="bento__text">
                <AddressText />
              </address>
              <ExternalLink className="btn btn--primary btn--sm interactive-hover" href={SITE.address.mapsUrl}>
                <InteractiveHoverContent>{direct.addressCta}</InteractiveHoverContent>
              </ExternalLink>
            </div>
          </div>
        </section>

        <section className="contact-page__section social-wall" aria-labelledby="contacto-redes">
          <div className="social-wall__intro">
            <p className="social-wall__eyebrow">{social.eyebrow}</p>
            <h2 id="contacto-redes" className="social-wall__title">
              {social.title}
            </h2>
            <p className="social-wall__lead">{social.lead}</p>
            <div className="social-wall__links">
              {(['facebook', 'instagram'] as const).map((brand) => (
                <ExternalLink key={brand} className={cx('social-wall__link', `social-wall__link--${brand}`)} href={SITE.social[brand]}>
                  <BrandIcon name={brand} size={22} />
                  {SOCIAL_CARDS[lang][brand].cta}
                  <Icon name="arrowRight" size={18} />
                </ExternalLink>
              ))}
            </div>
            <p className="social-wall__note">{PRIVACY_NOTE[lang]}</p>
          </div>
          <div className="social-wall__windows">
            <SocialWindow brand="facebook" src={facebookEmbed} title={a11y.facebookTitle} />
            <SocialWindow brand="instagram" src={INSTAGRAM_EMBED} title={a11y.instagramTitle} />
          </div>
        </section>
      </div>
    </Band>
  )
}
