// ─────────────────────────────────────────────────────────────────────────────
// ESQUELETO DE TODAS LAS PÁGINAS
//
// Orden: enlace "Saltar al contenido" → Header → contenido de la página → Footer.
// Decide qué página mostrar según la URL (rutas, en /en/ y /es/, en src/config/routes.ts) y fija el idioma
// (LangContext) para todo el árbol. La página se elige por la CLAVE de la ruta (PAGES), igual en los dos idiomas:
// • home → HomePage (src/pages/home/HomePage.tsx).
// • services → ServicesPage (tarjetas de todos los servicios, src/pages/services/ServicesPage.tsx).
// • benefits → BenefitsPage (promociones, convenios y aseguranzas, src/pages/benefits/BenefitsPage.tsx).
// • promotions, agreements, insurance → PromotionsPage, AgreementsPage e InsurancePage (cada una con su diseño).
// • contact → ContactPage (teléfonos, dirección y redes, src/pages/contact/ContactPage.tsx).
// • about → AboutPage (historia, misión y visión, equipo; src/pages/about/AboutPage.tsx).
// • privacy, terms → PrivacyPage / TermsPage (src/pages/legal/).
// • faq → FaqPage (src/pages/faq/FaqPage.tsx).
// • Rutas con template 'service' y textos en src/data/services.ts → ServicePage (plantilla de servicio).
// • Rutas con template 'blog' (hub, categorías y artículos, en los dos idiomas) → BlogRoute (src/pages/blog/).
// • Cualquier otra ruta conocida → EmptyPage (destino en construcción, noindex).
// • Ruta desconocida → EmptyPage con el mensaje de "página no encontrada".
// ─────────────────────────────────────────────────────────────────────────────

import { lazy, Suspense, useEffect } from 'react'
import { initPointerGlow } from '@/lib/pointerGlow'
import { FloatingContact } from '@/components/ui/FloatingContact'
import { RingCursor } from '@/components/decor/RingCursor'
import { LangContext } from '@/app/lang'
import { UI } from '@/data/ui'
import { findRoute, type RouteKey, type ServiceKey } from '@/config/routes'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageGradient } from '@/components/decor/PageGradient'
import { HomePage } from '@/pages/home/HomePage'
import { EmptyPage } from '@/pages/empty/EmptyPage'
import { BenefitsPage } from '@/pages/benefits/BenefitsPage'
import { SERVICE_PAGES } from '@/data/services'

// Inicio y Beneficios van en el paquete principal (Beneficios: los boletos no cambian su forma de carga); las demás páginas se
// descargan solo al visitarlas. El prerender (entry-server) espera a que carguen, así que el HTML sale completo.
const BlogRoute = lazy(() => import('@/pages/blog/BlogRoute').then((m) => ({ default: m.BlogRoute })))
const ServicePage = lazy(() => import('@/pages/service/ServicePage').then((m) => ({ default: m.ServicePage })))
const ServicesPage = lazy(() => import('@/pages/services/ServicesPage').then((m) => ({ default: m.ServicesPage })))
const PromotionsPage = lazy(() => import('@/pages/promotions/PromotionsPage').then((m) => ({ default: m.PromotionsPage })))
const AgreementsPage = lazy(() => import('@/pages/agreements/AgreementsPage').then((m) => ({ default: m.AgreementsPage })))
const ContactPage = lazy(() => import('@/pages/contact/ContactPage').then((m) => ({ default: m.ContactPage })))
const AboutPage = lazy(() => import('@/pages/about/AboutPage').then((m) => ({ default: m.AboutPage })))
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('@/pages/legal/TermsPage').then((m) => ({ default: m.TermsPage })))
const FaqPage = lazy(() => import('@/pages/faq/FaqPage').then((m) => ({ default: m.FaqPage })))
const InsurancePage = lazy(() => import('@/pages/insurance/InsurancePage').then((m) => ({ default: m.InsurancePage })))

interface AppProps {
  path: string
}

/** Páginas con componente propio, por clave de ruta (cada una lee su idioma con useLang). */
const PAGES: Partial<Record<RouteKey, React.ComponentType>> = {
  home: HomePage,
  services: ServicesPage,
  benefits: BenefitsPage,
  promotions: PromotionsPage,
  agreements: AgreementsPage,
  insurance: InsurancePage,
  contact: ContactPage,
  about: AboutPage,
  privacy: PrivacyPage,
  terms: TermsPage,
  faq: FaqPage,
}

/** Archivo de cada página diferida (mismos imports que los lazy de arriba): el prerender precarga su paquete en el HTML. */
const LAZY_SOURCES: Partial<Record<RouteKey, string>> = {
  services: 'src/pages/services/ServicesPage.tsx',
  promotions: 'src/pages/promotions/PromotionsPage.tsx',
  agreements: 'src/pages/agreements/AgreementsPage.tsx',
  insurance: 'src/pages/insurance/InsurancePage.tsx',
  contact: 'src/pages/contact/ContactPage.tsx',
  about: 'src/pages/about/AboutPage.tsx',
  privacy: 'src/pages/legal/PrivacyPage.tsx',
  terms: 'src/pages/legal/TermsPage.tsx',
  faq: 'src/pages/faq/FaqPage.tsx',
}

/** Archivo de la página diferida que muestra `path` (misma elección que App), o null si va en el paquete principal. */
// eslint-disable-next-line react-refresh/only-export-components -- vive junto a PAGES para que no se desincronicen; solo lo usa el prerender
export function lazySourceOf(path: string): string | null {
  const route = findRoute(path)
  if (PAGES[route.key]) return LAZY_SOURCES[route.key] ?? null
  if (route.template === 'service' && SERVICE_PAGES[route.lang][route.key as ServiceKey]) return 'src/pages/service/ServicePage.tsx'
  if (route.template === 'blog') return 'src/pages/blog/BlogRoute.tsx'
  return null
}

export function App({ path }: AppProps) {
  const route = findRoute(path)
  const Page = PAGES[route.key]
  useEffect(initPointerGlow, [])
  const service = route.template === 'service' ? SERVICE_PAGES[route.lang][route.key as ServiceKey] : undefined

  return (
    <LangContext value={route.lang}>
      <FloatingContact />
      <RingCursor />
      <a className="skip-link" href="#contenido">
        {UI[route.lang].skipLink}
      </a>
      {/* El degradado fijo cubre header, contenido y footer (page-shell): el header y el pie lo llevan de fondo. */}
      <div className="page-shell">
        <PageGradient />
        <Header route={route} />
        <main id="contenido" tabIndex={-1}>
          <Suspense fallback={null}>
            {Page ? (
              <Page />
            ) : service ? (
              <ServicePage route={route} content={service} />
            ) : route.template === 'blog' ? (
              <BlogRoute route={route} />
            ) : (
              <EmptyPage route={route} />
            )}
          </Suspense>
        </main>
        <Footer route={route} />
      </div>
    </LangContext>
  )
}
