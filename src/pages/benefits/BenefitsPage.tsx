import { LiquidGlassContent, LiquidMetalArrow } from '@/components/ui/AnimatedButtons'
// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA /beneficios/: encabezado con la idea central y un post promocional, tres tarjetas
// (promociones, aseguranzas, convenios) y franja de contacto. Estructura parecida a /servicios/, con su propia composición.
//
// • Textos, tarjetas y lista de beneficios → src/data/benefits.ts.
// • Estilos → src/styles/pages/benefits.css. Mismo fondo de plasma que /servicios/.
// ─────────────────────────────────────────────────────────────────────────────

import { useLang } from '@/app/lang'
import { BENEFIT_CARDS, BENEFIT_CARDS_CTA, BENEFITS_CTA, BENEFITS_HERO, type BenefitCard } from '@/data/benefits'
import { PARTNERS_CTA } from '@/data/partners'
import { Band } from '@/components/decor/Band'
import { PlasmaBackground } from '@/components/decor/PlasmaBackground'
import { Icon } from '@/components/ui/Icon'
import { TextBlurReveal } from '@/components/ui/TextBlurReveal'

function BenefitCardView({ card }: { card: BenefitCard }) {
  const ctaLabel = BENEFIT_CARDS_CTA[useLang()]
  return (
    <article className="benefit-card">
      <div className="benefit-card__top">
        <div className="benefit-card__head">
          <span className="icon-badge benefit-card__icon siri" aria-hidden="true">
            <Icon name={card.icon} size={26} />
          </span>
          <h2 className="benefit-card__title">{card.title}</h2>
        </div>
        {card.badge && <span className="benefit-card__badge">{card.badge}</span>}
        <p className="benefit-card__text">{card.text}</p>
      </div>
      {/* Talón: el contenedor gira al arrancarse; dentro, la pieza con el botón (recortada), su contorno rojo y el doblez. */}
      <div className="benefit-card__stub">
        <div className="benefit-card__footer">
          {/* El texto visible lo repite el nombre accesible del enlace (aria-label). */}
          <span className="benefit-card__cta" aria-hidden="true">
            {ctaLabel}
          </span>
          <a className="benefit-card__arrow liquid-metal" href={card.href} aria-label={`${ctaLabel}: ${card.title}`}>
            <LiquidMetalArrow />
          </a>
        </div>
        <span className="benefit-card__outline" aria-hidden="true" />
        <span className="ticket-fold" aria-hidden="true" />
      </div>
    </article>
  )
}

export function BenefitsPage() {
  const lang = useLang()
  const cards = BENEFIT_CARDS[lang]
  const hero = BENEFITS_HERO[lang]
  const cta = BENEFITS_CTA[lang]
  return (
    <Band
      tone="gradient"
      className="benefits"
      labelledBy="beneficios-titulo"
      decor={
        <div className="benefits__plasma">
          <PlasmaBackground
            className="benefits__plasma-view"
            color="#7bc3eb"
            opacity={0.5}
            scale={0.6}
            speed={1.4}
            iterations={45}
            renderScale={0.4}
            targetFps={30}
            maxDpr={1}
          />
        </div>
      }
    >
      <div className="container">
        <header className="benefits-hero">
          <div className="benefits-hero__text">
            <p className="benefits-hero__eyebrow pill-label">{hero.eyebrow}</p>
            <h1 id="beneficios-titulo" className="benefits-hero__title shiny-text">
              <span className="benefits-hero__lead-line"><TextBlurReveal text={hero.titleLead} /></span>{' '}
              <span className="benefits-hero__accent"><TextBlurReveal text={hero.titleAccent} start={hero.titleLead.split(' ').length} /></span>
            </h1>
            <p className="benefits-hero__lead">{hero.lead}</p>
            <ul className="benefits-hero__features">
              {hero.features.map((feature) => (
                <li key={feature.text}>
                  <span className="benefits-hero__feature-icon">
                    <Icon name={feature.icon} size={22} />
                  </span>
                  {feature.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="benefits-hero__photo">
            <div className="benefits-hero__frame">
              <img
                className="benefits-hero__image"
                src={lang === 'es' ? '/images/beneficios/beneficios-dental-nakeji.webp' : '/images/beneficios/benefits-dental-nakeji.webp'}
                width={1536}
                height={1024}
                alt={lang === 'es' ? 'Dental Nakeji: promociones, convenios y aseguranzas americanas. Aquí te cuidamos.' : 'Dental Nakeji: promotions, partner agreements and U.S. dental insurance. We care for you.'}
              />
            </div>
          </div>
        </header>

        <ul className="benefit-grid">
          {cards.map((card) => (
            <li key={card.id} className="benefit-grid__item">
              <BenefitCardView card={card} />
            </li>
          ))}
        </ul>

        <div className="benefits-cta">
          <div className="benefits-cta__body">
            <span className="benefits-cta__icon" aria-hidden="true">
              <Icon name="whatsapp" size={28} />
            </span>
            <div>
              <h2 className="benefits-cta__title">{cta.title}</h2>
              <p className="benefits-cta__text">{cta.text}</p>
            </div>
          </div>
          {/* Talón: el contenedor gira al arrancarse; dentro, la pieza con el botón (recortada), su contorno verde y el doblez. */}
          <div className="benefits-cta__tear">
            <div className="benefits-cta__stub">
              <a className="btn benefits-cta__btn liquid-glass" href={PARTNERS_CTA.href}>
                <LiquidGlassContent>{cta.label}<Icon name="arrowRight" size={18} /></LiquidGlassContent>
              </a>
            </div>
            <span className="benefits-cta__outline" aria-hidden="true" />
            <span className="ticket-fold" aria-hidden="true" />
          </div>
        </div>
      </div>
    </Band>
  )
}
