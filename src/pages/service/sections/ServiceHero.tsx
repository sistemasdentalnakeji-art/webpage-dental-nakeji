import { InteractiveHoverContent } from '@/components/ui/AnimatedButtons'
// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1 DE SERVICIO: HERO con foto de borde a borde
//
// Foto de fondo + degradado de izquierda (oscuro) a derecha (transparente) + contenido a la izquierda:
// ruta (Servicios / nombre) → título → gancho → 3 frases → botones WhatsApp y Reservar cita.
// • Textos e imagen → src/data/services.ts.
// • Estilos → src/styles/pages/service.css.
// ─────────────────────────────────────────────────────────────────────────────

import { useLang } from '@/app/lang'
import { UI } from '@/data/ui'
import { routeOf, SCHEDULE_ANCHOR } from '@/config/routes'
import { SITE } from '@/config/site'
import type { ServiceContent } from '@/data/services'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Icon } from '@/components/ui/Icon'
import { SectionDecor } from '@/components/decor/SectionDecor'
import { TextBlurReveal } from '@/components/ui/TextBlurReveal'

interface ServiceHeroProps {
  /** Nombre corto del servicio (migas de pan). */
  label: string
  content: ServiceContent
}

export function ServiceHero({ label, content }: ServiceHeroProps) {
  const { image } = content
  const lang = useLang()
  const services = routeOf('services', lang)
  const ui = UI[lang].service

  return (
    <section className="service-hero" aria-labelledby="servicio-titulo">
      {/* Foto decorativa de fondo (opcional): la imagen más grande de la página, se carga con prioridad.
          Sin foto queda el azul marino de la marca. */}
      {image && (
        <img
          className={image.flip ? 'service-hero__image service-hero__image--flip' : 'service-hero__image'}
          src={image.src}
          // Versiones de 640 y 1280 px (public/images/servicios/640 y /1280): el celular no baja la de 2000 px.
          srcSet={`${image.src.replace('/servicios/', '/servicios/640/')} 640w, ${image.src.replace('/servicios/', '/servicios/1280/')} 1280w, ${image.src} ${image.width}w`}
          sizes="100vw"
          width={image.width}
          height={image.height}
          alt=""
          fetchPriority="high"
          decoding="async"
          style={image.position ? { objectPosition: image.position } : undefined}
        />
      )}
      <div className="service-hero__scrim" aria-hidden="true" />
      <SectionDecor variant="wave" position="bottom" />

      <div className="container">
        <div className="service-hero__content">
          <nav className="service-hero__crumbs" aria-label={ui.crumbs}>
            <ol>
              <li>
                <a href={services.path}>{services.label}</a>
              </li>
              <li aria-current="page">{label}</li>
            </ol>
          </nav>

          <h1 id="servicio-titulo" className="service-hero__title shiny-text">
            <TextBlurReveal text={content.title} />
          </h1>

          <p className="service-hero__subtitle">{content.subtitle}</p>

          <ul className="service-hero__list">
            {content.highlights.map((text) => (
              <li key={text}>
                <Icon name="check" size={18} />
                {text}
              </li>
            ))}
          </ul>

          <div className="service-hero__actions">
            <ExternalLink className="btn btn--lg service-hero__whatsapp" href={SITE.social.whatsapp}>
              <Icon name="whatsapp" size={20} />
              {ui.whatsapp}
            </ExternalLink>
            <a className="btn btn--lg service-hero__cta interactive-hover" href={`#${SCHEDULE_ANCHOR}`}>
              <InteractiveHoverContent bell>{ui.book}</InteractiveHoverContent>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
