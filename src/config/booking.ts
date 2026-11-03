// Configuración del formulario de citas (Google Calendar vía Google Apps Script).
// Guía de instalación: integrations/google-calendar/README.md
//
// Horario confirmado con la clínica: 8:00 a 17:30 (sábado hasta 16:00). Debe coincidir
// con CONFIG en integrations/google-calendar/Code.gs, que es quien valida al final.

import { ALL_SERVICE_KEYS, routeOf } from '@/config/routes'

/**
 * Opciones del campo "Servicio de interés", en el orden en que se muestran (cambia el orden aquí).
 * Deben ser idénticas, y en el mismo orden, a SERVICES de integrations/google-calendar/Code.gs.
 */
const SERVICES = [
  'Valoración general',
  'Limpieza dental',
  'Implantes dentales',
  'All on 4 implants',
  'All on 6 implants',
  'Coronas',
  'Carillas dentales',
  'Blanqueamiento dental',
  'Endodoncias',
  'Ortodoncia',
  'Alineadores',
  'Odontopediatría',
  'Dentaduras',
  'Periodoncia',
  'Extracciones simples y de juicio',
]

// Las páginas de servicio preseleccionan su servicio por nombre: si falta en la lista, falla al compilar.
// Se compara con el nombre en español (`es`): es el valor fijo que guarda y valida Code.gs; no se traduce.
for (const key of ALL_SERVICE_KEYS) {
  const { label } = routeOf(key, 'es')
  if (!SERVICES.includes(label)) throw new Error(`Falta "${label}" en SERVICES de src/config/booking.ts`)
}

/** Grupos del selector de servicio (solo presentación: el orden y los valores de SERVICES no cambian). */
export const SERVICE_GROUPS = [
  { id: 'general', icon: 'tooth', services: ['Valoración general', 'Limpieza dental', 'Endodoncias', 'Extracciones simples y de juicio', 'Odontopediatría'] },
  { id: 'aesthetic', icon: 'sparkle', services: ['Carillas dentales', 'Blanqueamiento dental', 'Coronas'] },
  { id: 'implants', icon: 'implant', services: ['Implantes dentales', 'All on 4 implants', 'All on 6 implants', 'Dentaduras'] },
  { id: 'specialties', icon: 'braces', services: ['Ortodoncia', 'Alineadores', 'Periodoncia'] },
] as const

// Cada servicio debe estar en exactamente un grupo: si falta o sobra, falla al compilar.
const grouped: string[] = SERVICE_GROUPS.flatMap((group) => group.services)
if (grouped.length !== SERVICES.length || !SERVICES.every((service) => grouped.includes(service))) {
  throw new Error('SERVICE_GROUPS de src/config/booking.ts no coincide con SERVICES')
}

export const BOOKING = {
  /** URL /exec de la aplicación web de Apps Script (variable VITE_BOOKING_ENDPOINT). */
  endpoint: (import.meta.env.VITE_BOOKING_ENDPOINT ?? '').trim(),
  /** Llave pública de Cloudflare Turnstile (casilla anti-bots). Vacía = el formulario no la muestra. */
  turnstileSiteKey: (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '').trim(),
  /** Zona horaria de la clínica (igual que appsscript.json). */
  timeZone: 'America/Tijuana',
  /** Hasta cuántos días adelante se puede pedir cita. */
  daysAhead: 60,
  /** Días sin atención: 0 = domingo … 6 = sábado. */
  closedWeekdays: [0] as number[],
  /** Horarios que puede elegir el paciente (formato 24 h). */
  slots: [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ],
  /** Último horario que se puede pedir en ciertos días (0 = domingo … 6 = sábado): los sábados, hasta las 4:00 p. m. */
  lastSlotByWeekday: { 6: '16:00' } as Record<number, string>,
  /** Opciones del campo "Servicio de interés". */
  services: SERVICES,
}

export const isBookingConfigured =
  /^https:\/\/script\.google\.com\//.test(BOOKING.endpoint) ||
  // Solo en desarrollo: permite probar con un servidor simulado local.
  (import.meta.env.DEV && /^http:\/\/localhost:\d+/.test(BOOKING.endpoint))
