// ─────────────────────────────────────────────────────────────────────────────
// TEXTOS DEL FORMULARIO DE CITAS, por idioma: etiquetas, botones, mensajes de error, validación y confirmación.
// Lo usan BookingForm.tsx y booking.ts. Equivalencias: gan-harness/glosario-en.md.
//
// IMPORTANTE: lo que se ENVÍA al Apps Script no cambia con el idioma: el servicio sigue siendo su nombre en español
// (valor de BOOKING.services, el que valida Code.gs); aquí solo se traduce la etiqueta que ve la persona (`serviceLabel`).
// ─────────────────────────────────────────────────────────────────────────────

import { ALL_SERVICE_KEYS, routeOf, type Lang } from '@/config/routes'

export interface FormText {
  eyebrow: string
  title: string
  lead: (service: string) => string
  leadGeneric: string
  requiredBefore: string
  requiredSr: string
  requiredAfter: string
  optional: string
  groups: { data: string; appointment: string; finish: string }
  labels: {
    firstName: string
    lastName: string
    phone: string
    email: string
    service: string
    servicePlaceholder: string
    timePlaceholder: string
    serviceGroups: { general: string; aesthetic: string; implants: string; specialties: string }
    morning: string
    afternoon: string
    date: string
    time: string
    firstVisit: string
    firstVisitYes: string
    firstVisitNo: string
    comments: string
    commentsHint: string
    honeypot: string
  }
  consent: { before: string; link: string; after: string }
  submit: string
  sending: string
  sendingSr: string
  fine: string
  whatsapp: string
  errors: { busy: string; invalid: string; limit: string; network: string; captcha: string }
  success: {
    title: (name: string) => string
    service: string
    date: string
    time: string
    text: string
    emailSent: string
  }
  validation: {
    firstName: string
    lastName: string
    phone: string
    email: string
    service: string
    date: string
    dateRange: (days: number) => string
    closed: string
    time: string
    firstVisit: string
    consent: string
    comments: string
    server: string
  }
}

export const FORM_TEXT: Record<Lang, FormText> = {
  en: {
    eyebrow: 'Book online',
    title: 'Request an appointment',
    lead: (service) => `Choose the best day and time for your appointment: ${service}.`,
    leadGeneric: 'Choose the service, day and time that work best for you.',
    requiredBefore: 'Fields marked with ',
    requiredSr: 'asterisk',
    requiredAfter: ' are required.',
    optional: ' (optional)',
    groups: { data: 'Your details', appointment: 'Your appointment', finish: 'To finish' },
    labels: {
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone or WhatsApp',
      email: 'Email',
      service: 'Service you are interested in',
      servicePlaceholder: 'Select a service',
      timePlaceholder: 'Select a time',
      serviceGroups: { general: 'General', aesthetic: 'Cosmetic', implants: 'Implants and dentures', specialties: 'Specialties' },
      morning: 'Morning',
      afternoon: 'Afternoon',
      date: 'Preferred date',
      time: 'Preferred time',
      firstVisit: 'Is this your first visit?',
      firstVisitYes: 'Yes, I am a new patient',
      firstVisitNo: 'No, I am an existing patient',
      comments: 'Comments',
      commentsHint:
        'Briefly tell us the reason for your visit. Do not include detailed medical information, insurance details, or your Social Security number.',
      honeypot: 'Website',
    },
    consent: {
      before: 'I accept the ',
      link: 'Privacy Notice',
      after: ' and authorize the use of my data, including health data, to handle my request.',
    },
    submit: 'Request appointment',
    sending: 'Sending…',
    sendingSr: 'Sending request…',
    fine: 'Appointments are subject to availability and confirmation.',
    whatsapp: 'Open WhatsApp',
    errors: {
      busy: 'That time slot is already taken. Please choose another date or time.',
      invalid: 'Please check the form details and try again.',
      limit:
        'We already received a recent request from this phone number. To book another appointment, message us on WhatsApp.',
      network: 'We could not send your request. Please try again or message us on WhatsApp.',
      captcha: 'Please complete the security check and try again.',
    },
    success: {
      title: (name) => `Thank you, ${name}! We received your request.`,
      service: 'Service',
      date: 'Date',
      time: 'Time',
      text: 'We will contact you by phone or WhatsApp to confirm your appointment.',
      emailSent: 'We sent a receipt to your email.',
    },
    validation: {
      firstName: 'Enter your first name.',
      lastName: 'Enter your last name.',
      phone: 'Enter a phone number with at least 10 digits, numbers only.',
      email: 'Check the email format.',
      service: 'Choose the service you are interested in.',
      date: 'Choose a date.',
      dateRange: (days) => `Choose a date between tomorrow and the next ${days} days.`,
      closed: 'We are closed that day. Choose another date.',
      time: 'Choose a time.',
      firstVisit: 'Tell us whether this is your first visit.',
      consent: 'We need your authorization to schedule the appointment.',
      comments: 'Please remove links from the comments.',
      server: 'Check this field.',
    },
  },
  es: {
    eyebrow: 'Reserva en línea',
    title: 'Solicita tu cita',
    lead: (service) => `Elige el día y la hora que mejor te acomoden para tu cita de ${service}.`,
    leadGeneric: 'Elige el servicio, el día y la hora que mejor te acomoden.',
    requiredBefore: 'Los campos con ',
    requiredSr: 'asterisco',
    requiredAfter: ' son obligatorios.',
    optional: ' (opcional)',
    groups: { data: 'Tus datos', appointment: 'Tu cita', finish: 'Para terminar' },
    labels: {
      firstName: 'Nombre(s)',
      lastName: 'Apellidos',
      phone: 'Teléfono o WhatsApp',
      email: 'Correo electrónico',
      service: 'Servicio de interés',
      servicePlaceholder: 'Selecciona un servicio',
      timePlaceholder: 'Selecciona un horario',
      serviceGroups: { general: 'Generales', aesthetic: 'Estética', implants: 'Implantes y prótesis', specialties: 'Especialidades' },
      morning: 'Mañana',
      afternoon: 'Tarde',
      date: 'Fecha preferida',
      time: 'Horario preferido',
      firstVisit: '¿Es tu primera visita?',
      firstVisitYes: 'Sí, soy paciente nuevo',
      firstVisitNo: 'No, ya soy paciente',
      comments: 'Comentarios',
      commentsHint:
        'Cuéntanos brevemente el motivo de tu visita. No escribas información médica detallada, datos de tu seguro ni tu número de seguro social.',
      honeypot: 'Sitio web',
    },
    consent: { before: 'Acepto el ', link: 'aviso de privacidad', after: ' y autorizo el uso de mis datos, incluidos los de salud, para atender mi solicitud.' },
    submit: 'Solicitar cita',
    sending: 'Enviando…',
    sendingSr: 'Enviando solicitud…',
    fine: 'La cita queda sujeta a disponibilidad y confirmación.',
    whatsapp: 'Abrir WhatsApp',
    errors: {
      busy: 'Ese horario ya está ocupado. Elige otra fecha u hora, por favor.',
      invalid: 'Revisa los datos del formulario e inténtalo de nuevo.',
      limit: 'Ya recibimos una solicitud reciente desde este teléfono. Para agendar otra cita, escríbenos por WhatsApp.',
      network: 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.',
      captcha: 'Completa la verificación de seguridad e inténtalo de nuevo.',
    },
    success: {
      title: (name) => `¡Gracias, ${name}! Recibimos tu solicitud.`,
      service: 'Servicio',
      date: 'Fecha',
      time: 'Hora',
      text: 'Te contactaremos por teléfono o WhatsApp para confirmar tu cita.',
      emailSent: 'Te enviamos un comprobante a tu correo.',
    },
    validation: {
      firstName: 'Escribe tu nombre.',
      lastName: 'Escribe tus apellidos.',
      phone: 'Escribe un teléfono de al menos 10 dígitos, solo con números.',
      email: 'Revisa el formato del correo.',
      service: 'Elige el servicio que te interesa.',
      date: 'Elige una fecha.',
      dateRange: (days) => `Elige una fecha entre mañana y los próximos ${days} días.`,
      closed: 'Ese día no hay atención. Elige otra fecha.',
      time: 'Elige un horario.',
      firstVisit: 'Indica si es tu primera visita.',
      consent: 'Necesitamos tu autorización para agendar la cita.',
      comments: 'Quita los enlaces de los comentarios.',
      server: 'Revisa este dato.',
    },
  },
}

/** Etiqueta que ve la persona para un servicio (el valor enviado sigue siendo el nombre en español). */
export function serviceLabel(value: string, lang: Lang): string {
  if (lang === 'es') return value
  if (value === 'Valoración general') return 'Consultation and exam'
  const key = ALL_SERVICE_KEYS.find((item) => routeOf(item, 'es').label === value)
  return key ? routeOf(key, 'en').label : value
}
