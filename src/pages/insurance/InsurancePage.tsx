// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA /insurance/ — diseño "Tablero": encabezado con los 3 pasos y, debajo, TODAS las aseguranzas a la vista en
// una rejilla de líneas finas con marcas "+" en los cruces (inspirada en "Logo Cloud 2" de 21st.dev, código propio).
//
// • Los logos no se mueven nunca; lo único animado es la luz tipo "Snake" que recorre celdas al azar (InsuranceGrid.tsx).
// • Sin fondo propio (se define después). Logos → src/data/partners.ts (INSURANCES); textos → src/data/benefitPages.ts.
// • Estilos → src/styles/pages/insurance.css.
// ─────────────────────────────────────────────────────────────────────────────

import { BENEFITS_BACK, INSURANCE_GRID, INSURANCE_INTRO, INSURANCE_STEPS, PAGE_CTA } from '@/data/benefitPages'
import { INSURANCES, PARTNERS_CTA } from '@/data/partners'
import { InsuranceGrid } from '@/pages/insurance/InsuranceGrid'
import { useLang } from '@/app/lang'
import { routeOf } from '@/config/routes'
import { PagePlasma } from '@/components/decor/PagePlasma'
import { Band } from '@/components/decor/Band'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Icon } from '@/components/ui/Icon'
import { TextBlurReveal } from '@/components/ui/TextBlurReveal'

export function InsurancePage() {
  const lang = useLang()
  const benefits = routeOf('benefits', lang)
  return (
    <Band tone="gradient" className="insurance band--clip" decor={<PagePlasma />} labelledBy="aseguranzas-pagina-titulo">
      <div className="container">
        <a className="page-back" href={benefits.path}>
          <Icon name="chevronLeft" size={16} />
          {BENEFITS_BACK[lang]}
        </a>

        <div className="insurance__head">
          <div>
            <p className="page-eyebrow pill-label">{INSURANCE_INTRO[lang].eyebrow}</p>
            <h1 id="aseguranzas-pagina-titulo" className="page-title shiny-text">
              <TextBlurReveal text={INSURANCE_INTRO[lang].title} />
            </h1>
            <p className="page-lead">{INSURANCE_INTRO[lang].lead}</p>
          </div>

          <div className="insurance__steps-card">
            <ol className="insurance__steps" role="list">
              {INSURANCE_STEPS[lang].map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <ExternalLink className="btn btn--secondary" href={PARTNERS_CTA.href}>
              <Icon name="whatsapp" size={20} />
              {PAGE_CTA[lang]}
            </ExternalLink>
          </div>
        </div>

        <section className="insurers" aria-labelledby="aseguranzas-lista">
          <div className="insurers__bar">
            <h2 id="aseguranzas-lista" className="insurers__count">
              {INSURANCE_GRID[lang].title}
            </h2>
          </div>

          <InsuranceGrid insurers={INSURANCES} />
        </section>
      </div>
    </Band>
  )
}
