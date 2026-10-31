// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA VACÍA: contenedor para los destinos que aún no tienen contenido (y para el 404).
// Estas páginas se generan con "noindex" para que Google no las indexe todavía.
// Estilos → src/styles/pages/empty.css.
// ─────────────────────────────────────────────────────────────────────────────

import { routeOf, type RouteDef } from '@/config/routes'
import { UI } from '@/data/ui'
import { Band } from '@/components/decor/Band'
import { TextBlurReveal } from '@/components/ui/TextBlurReveal'

interface EmptyPageProps {
  route: RouteDef
  message?: string
}

/** Contenedor reutilizable para destinos que aún no tienen contenido (noindex). */
export function EmptyPage({ route, message }: EmptyPageProps) {
  const ui = UI[route.lang].empty
  return (
    <Band className="empty-page" tone="white" labelledBy="pagina-titulo">
      <div className="container empty-page__inner">
        <h1 id="pagina-titulo" className="empty-page__title shiny-text shiny-text--ink">
          <TextBlurReveal text={route.label} />
        </h1>
        <p className="section-text">{message ?? (route.key === 'notFound' ? ui.notFound : ui.soon)}</p>
        <a className="text-link" href={routeOf('home', route.lang).path}>
          {ui.backHome}
        </a>
      </div>
    </Band>
  )
}
