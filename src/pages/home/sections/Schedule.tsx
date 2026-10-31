// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN "AGENDA TU VISITA" (id="agendar"; el botón "Agendar visita" baja hasta aquí)
//
// Izquierda: título, pasos y alternativa por WhatsApp/teléfono. Derecha: formulario de citas.
// • Textos → src/data/home.ts (SCHEDULE).
// • Formulario → src/features/booking/BookingForm.tsx (horarios en src/config/booking.ts).
// • Estilos → src/styles/pages/home/schedule.css.
// ─────────────────────────────────────────────────────────────────────────────

import { useLang } from '@/app/lang'
import { SCHEDULE_ANCHOR } from '@/config/routes'
import { SITE } from '@/config/site'
import { SCHEDULE } from '@/data/home'
import { UI } from '@/data/ui'
import { BookingForm } from '@/features/booking/BookingForm'
import { Band } from '@/components/decor/Band'
import { ParticlesBackground } from '@/components/decor/ParticlesBackground'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Icon } from '@/components/ui/Icon'
import { SectionIntro } from '@/components/ui/SectionIntro'

interface ScheduleProps {
  /** Servicio preseleccionado en el formulario (se usa en las páginas de servicio). */
  service?: string
  /** Fondo de partículas. Las páginas de servicio lo apagan (fondo sin animación). */
  flow?: boolean
}

/** También es la sección 3 de las páginas de servicio (src/pages/service/ServicePage.tsx). */
export function Schedule({ service, flow = true }: ScheduleProps) {
  const lang = useLang()
  const schedule = SCHEDULE[lang]
  return (
    <Band
      id={SCHEDULE_ANCHOR}
      tone="white"
      className="band--schedule"
      labelledBy="agendar-titulo"
      waveTop="plain"
      decor={flow && <ParticlesBackground density={130} max={360} avoid=".story__tip" />}
    >
      <div className="container">
        <div className="schedule">
          <div className="schedule__intro">
            <SectionIntro icon="calendar" id="agendar-titulo" title={schedule.title} text={schedule.text} />

            <ol className="steps">
              {schedule.steps.map((step, index) => (
                <li key={step} className="steps__item">
                  <span className="steps__number" aria-hidden="true">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="schedule__alt">
              <p className="schedule__alt-title">{schedule.alternative}</p>
              <div className="schedule__alt-actions">
                <ExternalLink className="btn btn--secondary schedule__whatsapp" href={SITE.social.whatsapp}>
                  <Icon name="whatsapp" size={20} />
                  {schedule.whatsappCta}
                </ExternalLink>
                <a className="text-link" href={SITE.phones[0].href}>
                  <Icon name="phone" size={18} />
                  {UI[lang].contact.call} {SITE.phones[0].displays[lang]}
                </a>
              </div>
            </div>
          </div>

          <div className="schedule__form">
            <BookingForm defaultService={service} />
          </div>
        </div>
      </div>
    </Band>
  )
}
