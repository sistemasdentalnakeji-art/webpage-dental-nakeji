// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA /convenios/ — diseño "Muro de marcas": una rejilla de fichas con los logos reales de las empresas con convenio
// y una tarjeta grande con título y texto (el muro y su ciclo automático viven en BrandWall.tsx). Abajo, una franja para
// empresas que aún no tienen convenio.
// Inspirado en "Pixel Logo Grid" de 21st.dev (código propio, sin librerías).
//
// • Empresas, orden (de más a menos popular), logos y color de marca → src/data/partners.ts (AGREEMENT_PARTNERS).
// • Textos → src/data/benefitPages.ts. Estilos → src/styles/pages/agreements.css.
// ─────────────────────────────────────────────────────────────────────────────

import { AGREEMENT_COMPANIES, AGREEMENT_JOIN, AGREEMENT_SUMMARY, AGREEMENTS_INTRO, BENEFITS_BACK, PAGE_CTA } from '@/data/benefitPages'
import { PARTNERS_CTA } from '@/data/partners'
import { useLang } from '@/app/lang'
import { routeOf } from '@/config/routes'
import { PagePlasma } from '@/components/decor/PagePlasma'
import { Band } from '@/components/decor/Band'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Icon } from '@/components/ui/Icon'
import { BrandWall } from '@/pages/agreements/BrandWall'
import { TextBlurReveal } from '@/components/ui/TextBlurReveal'

export function AgreementsPage() {
  const lang = useLang()
  const benefits = routeOf('benefits', lang)
  return (
    <Band tone="gradient" className="agreements band--clip" decor={<PagePlasma />} labelledBy="convenios-titulo">
      <div className="container">
        <a className="page-back" href={benefits.path}>
          <Icon name="chevronLeft" size={16} />
          {BENEFITS_BACK[lang]}
        </a>
        <header className="agreements__head">
          <p className="page-eyebrow pill-label">{AGREEMENTS_INTRO[lang].eyebrow}</p>
          <h1 id="convenios-titulo" className="page-title shiny-text">
            <TextBlurReveal text={AGREEMENTS_INTRO[lang].title} />
          </h1>
        </header>

        {/* Tarjeta para empresas sin convenio: arriba, entre el título y los logos (sustituye al subtítulo). */}
        <div className="agreements__join">
          <div>
            <h2 className="agreements__join-title">{AGREEMENT_JOIN[lang].title}</h2>
            <p className="agreements__join-text">{AGREEMENT_JOIN[lang].text}</p>
          </div>
          <ExternalLink className="btn btn--secondary" href={PARTNERS_CTA.href}>
            <Icon name="whatsapp" size={20} />
            {PAGE_CTA[lang]}
          </ExternalLink>
        </div>

        <BrandWall companies={AGREEMENT_COMPANIES} summary={AGREEMENT_SUMMARY[lang]} label={AGREEMENTS_INTRO[lang].title} />
      </div>
    </Band>
  )
}
