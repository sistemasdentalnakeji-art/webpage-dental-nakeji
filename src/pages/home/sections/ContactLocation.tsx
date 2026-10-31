// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN "CONTACTO Y UBICACIÓN": datos de contacto, redes sociales y la tarjeta de ubicación expandible (reemplaza al mapa de Google).
//
// • Dirección, teléfonos, correo y horario → src/config/site.ts (mapsUrl alimenta "Cómo llegar").
// • Título y texto → src/data/home.ts (CONTACT_SECTION).
// • Estilos → src/styles/pages/home/contact.css.
// ─────────────────────────────────────────────────────────────────────────────

import { useLang } from '@/app/lang'
import { SITE } from '@/config/site'
import { UI } from '@/data/ui'
import { CONTACT_SECTION } from '@/data/home'
import { AddressText } from '@/components/ui/AddressText'
import { Band } from '@/components/decor/Band'
import { ContactItem } from '@/components/ui/ContactItem'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { InteractiveHoverContent } from '@/components/ui/AnimatedButtons'
import { LocationMap } from '@/components/ui/LocationMap'
import { SectionDecor } from '@/components/decor/SectionDecor'
import { SectionIntro } from '@/components/ui/SectionIntro'
import { SocialLinks } from '@/components/ui/SocialLinks'

const { address } = SITE

export function ContactLocation() {
  const lang = useLang()
  const ui = UI[lang]
  const section = CONTACT_SECTION[lang]
  return (
    <Band
      id="ubicacion"
      tone="white"
      labelledBy="contacto-titulo"
      waveTop="flip"
      decor={<SectionDecor variant="rings" placement="contact" />}
    >
      <div className="container">
        <div className="contact">
          <div className="contact__info">
            <header className="contact__intro">
              <SectionIntro icon="pin" id="contacto-titulo" title={section.title} text={section.text} />
            </header>

            <address>
              <ul className="contact-list">
                <ContactItem icon="pin" label={ui.contact.address} siri>
                  <span className="contact-item__value contact-item__value--text">
                    <AddressText />
                  </span>
                  <ExternalLink className="btn btn--primary btn--sm interactive-hover" href={address.mapsUrl}>
                    <InteractiveHoverContent>{ui.contact.directions}</InteractiveHoverContent>
                  </ExternalLink>
                </ContactItem>
                {SITE.phones.map((phone) => (
                  <ContactItem key={phone.href} icon="phone" label={phone.labels[lang]} siri>
                    <a className="contact-item__value" href={phone.href}>
                      {phone.displays[lang]}
                    </a>
                  </ContactItem>
                ))}
                <ContactItem icon="mail" label={ui.contact.email} siri>
                  <a className="contact-item__value contact-item__value--email" href={`mailto:${SITE.email}`}>
                    {SITE.email}
                  </a>
                </ContactItem>
                {SITE.hours.length > 0 && (
                  <ContactItem icon="clock" label={ui.contact.hours}>
                    {SITE.hours.map((row) => (
                      <span key={row.days} className="contact-item__value contact-item__value--text">
                        {row.days}: {row.hours}
                      </span>
                    ))}
                  </ContactItem>
                )}
              </ul>
            </address>

            <div className="contact__social">
              <span className="contact-item__label">{ui.contact.follow}</span>
              <SocialLinks iconSize={40} />
            </div>
          </div>

          {/* Reemplaza al mapa de Google: tarjeta que se expande y llena el recuadro (components/ui/LocationMap.tsx). */}
          <div className="contact__map">
            <LocationMap name={SITE.name} tag={ui.map.tag} />
          </div>
        </div>
      </div>
    </Band>
  )
}
