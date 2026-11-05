// ─────────────────────────────────────────────────────────────────────────────
// PLANTILLA DE PÁGINA DE SERVICIO (implantes, all on 4, coronas, carillas…)
//
// Todas las páginas de servicio tienen la misma estructura:
//   1. Hero con foto de fondo, título, gancho, 3 frases y botones (WhatsApp / Reservar cita).
//   2. "Acerca del tratamiento": título-pregunta, un párrafo y botón al blog (ver ServiceAbout.tsx).
//   3. Agenda con el formulario de citas (id="agendar", el servicio llega preseleccionado).
// • Textos, imagen y enlace al blog de cada servicio → src/data/services.ts.
// • Estilos → src/styles/pages/service.css.
// ─────────────────────────────────────────────────────────────────────────────

import { routeOf, type RouteDef } from '@/config/routes'
import type { ServiceContent } from '@/data/services'
import { PagePlasma } from '@/components/decor/PagePlasma'
import { GlassLights } from '@/components/decor/GlassLights'
import { Schedule } from '@/pages/home/sections/Schedule'
import { ServiceHero } from '@/pages/service/sections/ServiceHero'
import { ServiceAbout } from '@/pages/service/sections/ServiceAbout'

interface ServicePageProps {
  route: RouteDef
  content: ServiceContent
}

export function ServicePage({ route, content }: ServicePageProps) {
  return (
    // Como el homepage (.home-canvas, home/canvas.css): un solo fondo para toda la página, el degradado azul fijo de
    // App.tsx (PageGradient), con la lámpara de lava (PagePlasma) encima; las secciones no llevan fondo propio.
    <div className="home-canvas service-canvas">
      {/* Solo las manchas azules: la dorada la pone PagePlasma encima de la lava. */}
      <GlassLights gold="none" />
      <PagePlasma />
      {/* 1. Hero con la foto del servicio */}
      <ServiceHero label={route.label} content={content} />
      {/* 2. Acerca del tratamiento */}
      <ServiceAbout content={content} serviceKey={route.key} />
      {/* 3. Agenda (el botón "Reservar cita" baja hasta aquí) */}
      {/* El formulario guarda el nombre en español (valor fijo que valida Code.gs), sea cual sea el idioma de la página. */}
      <Schedule service={routeOf(route.key, 'es').label} flow={false} />
    </div>
  )
}
