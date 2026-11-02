import { InteractiveHoverContent } from '@/components/ui/AnimatedButtons'
// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN HERO (primera pantalla del homepage)
//
// Fondo de fibras de luz animadas + orbe con el isotipo + título, texto, botones y frases.
// • Textos y tema (oscuro/claro) → src/data/home.ts (HERO).
// • Burbujas flotantes → hero.ambientLabels en src/data/home.ts.
// • Fibras de luz animadas → src/components/decor/FibersBackground.tsx (solo aquí). El degradado azul es el fondo fijo
//   compartido por toda la homepage (HomePage.tsx y home/canvas.css).
// • Estilos → src/styles/pages/home/hero.css.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react'
import { useLang } from '@/app/lang'
import { SCHEDULE_ANCHOR, routeOf, type ServiceKey } from '@/config/routes'
import { SITE } from '@/config/site'
import { HERO } from '@/data/home'
import { FibersBackground } from '@/components/decor/FibersBackground'
import { BrandOrb } from '@/components/ui/BrandOrb'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Icon } from '@/components/ui/Icon'
import { SectionDecor } from '@/components/decor/SectionDecor'
import { TextBlurReveal } from '@/components/ui/TextBlurReveal'

/** Servicio al que lleva cada burbuja, en el mismo orden que hero.ambientLabels (data/home.ts). */
const AMBIENT_SERVICES: ServiceKey[] = ['implants', 'crowns', 'veneers', 'whitening', 'cleaning', 'orthodontics']

export function Hero() {
  const lang = useLang()
  const hero = HERO[lang]
  return (
    <section className={`hero hero--${hero.theme}`} aria-labelledby="hero-titulo">
      <FibersBackground lightMode={hero.theme === 'light'} />
      <div className="hero__scrim" aria-hidden="true" />
      <SectionDecor variant="wave" position="bottom" />

      <ul className="hero__ambient">
        {hero.ambientLabels.map((label, index) => (
          <li key={label} style={{ '--i': index } as CSSProperties}>
            <a className="ambient-label" href={routeOf(AMBIENT_SERVICES[index], lang).path}>
              <Icon name="check" size={18} />
              {label}
            </a>
          </li>
        ))}
      </ul>

      <div className="container hero__inner">
        <div className="hero__content">
          <BrandOrb />

          <h1 id="hero-titulo" className="hero__title">
            <span className="hero__title-lead shiny-text"><TextBlurReveal text={hero.titleLead} /></span>{' '}
            <span className="hero__title-muted shiny-text">
              <TextBlurReveal text={hero.titleMuted} start={hero.titleLead.split(' ').length} />
            </span>
          </h1>

          <p className="hero__lead"><TextBlurReveal text={hero.lead} /></p>

          <div className="hero__actions">
            <a className="btn btn--lg hero__cta interactive-hover" href={`#${SCHEDULE_ANCHOR}`}>
              <InteractiveHoverContent bell>{hero.primaryCta}</InteractiveHoverContent>
            </a>
            <ExternalLink className="btn btn--lg hero__cta-alt" href={SITE.social.whatsapp}>
              <Icon name="whatsapp" size={20} />
              {hero.secondaryCta}
            </ExternalLink>
          </div>

          <ul className="hero__note">
            {hero.highlights.map((text) => (
              <li key={text}>
                <Icon name="check" size={20} />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
