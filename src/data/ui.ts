// ─────────────────────────────────────────────────────────────────────────────
// TEXTOS COMPARTIDOS DE LA INTERFAZ, por idioma (etiquetas de accesibilidad, botones y rótulos que usan varios componentes).
// Los componentes los leen con `UI[useLang()]`. Los textos propios de cada sección están en src/data/ (home.ts, footer.ts…).
// Términos médicos y de seguros: usa gan-harness/glosario-en.md.
// ─────────────────────────────────────────────────────────────────────────────

import type { Lang } from '@/config/routes'

interface UiText {
  skipLink: string
  mainNav: string
  menu: string
  /** Botón "Agendar visita" del header: la segunda parte se oculta en pantallas muy angostas. */
  scheduleShort: string
  scheduleRest: string
  logoAlt: (name: string) => string
  opensNewTab: string
  opensMaps: string
  pauseAnimations: string
  socialLabel: string
  socialLink: (label: string, name: string) => string
  carousel: { role: string; list: (label: string) => string; prev: (label: string) => string; next: (label: string) => string }
  stars: { pending: string; value: (rating: number) => string }
  map: { toggle: (name: string) => string; hint: string; tag: string }
  contact: { title: string; address: string; directions: string; email: string; hours: string; follow: string; call: string }
  reviews: { summary: string; pending: string; based: (total: number) => string; carousel: string; more: string }
  featured: { carousel: string; cta: string; badge: string }
  rights: string
  spin: {
    zoom: (alt: string) => string
    prev: string
    next: string
    expanded: (alt?: string) => string
    close: string
  }
  service: { crumbs: string; whatsapp: string; book: string; aboutEyebrow: string; blogCta: string }
  /** Blog (src/pages/blog/): rótulos y botones fijos; el contenido de los artículos va en blog-content(.en).json. */
  blog: {
    explore: string
    allServices: string
    book: string
    minutes: (n: number) => string
    answer: string
    sources: string
    crumbs: string
    chapters: string
    topicsNav: string
    articleCount: (n: number) => string
    inCategory: string
    moreTopics: string
    moreInTopic: string
    dateLocale: string
  }
  empty: { soon: string; notFound: string; backHome: string }
  /** Aviso en /es/ mientras el documento legal oficial solo existe en inglés (pendiente: traducción de la clínica). */
  legalNotice?: string
  /** Aviso de la página de preguntas frecuentes mientras no hay preguntas reales. */
  faqSoon: { title: string; text: string; contact: string }
}

export const UI: Record<Lang, UiText> = {
  en: {
    skipLink: 'Skip to content',
    mainNav: 'Main',
    menu: 'Menu',
    scheduleShort: 'Schedule',
    scheduleRest: ' a visit',
    logoAlt: (name) => `${name}, go to Home`,
    opensNewTab: ' (opens in a new tab)',
    opensMaps: ' (opens Google Maps in a new tab)',
    pauseAnimations: 'Pause animations',
    socialLabel: 'Social media',
    socialLink: (label, name) => `${label}: ${name} (opens in a new tab)`,
    carousel: {
      role: 'carousel',
      list: (label) => `List: ${label}`,
      prev: (label) => `Previous: ${label}`,
      next: (label) => `Next: ${label}`,
    },
    stars: { pending: 'Rating pending', value: (rating) => `Rating: ${rating} out of 5` },
    map: { toggle: (name) => `Location of ${name}`, hint: 'Tap to see the location', tag: 'Zona Río' },
    contact: {
      title: 'Contact',
      address: 'Address',
      directions: 'Get directions',
      email: 'Email',
      hours: 'Hours',
      follow: 'Follow us',
      call: 'Call',
    },
    reviews: {
      summary: 'Rating summary',
      pending: 'Google rating',
      based: (total) => `Based on ${total} Google reviews`,
      carousel: 'Patient reviews',
      more: 'Read on Google',
    },
    featured: { carousel: 'Most requested services', cta: 'Learn more about this service', badge: 'Most requested' },
    rights: 'All rights reserved.',
    spin: {
      zoom: (alt) => `Enlarge photo: ${alt}`,
      prev: 'Previous photo',
      next: 'Next photo',
      expanded: (alt) => (alt ? `Enlarged photo: ${alt}` : 'Enlarged photo'),
      close: 'Close enlarged photo',
    },
    service: {
      crumbs: 'Breadcrumb',
      whatsapp: 'WhatsApp',
      book: 'Book an appointment',
      aboutEyebrow: 'About the treatment',
      blogCta: 'Learn more about this treatment',
    },
    blog: {
      explore: 'Browse articles',
      allServices: 'See all services',
      book: 'Schedule a visit',
      minutes: (n) => `${n} min read`,
      answer: 'Short answer.',
      sources: 'Sources:',
      crumbs: 'Breadcrumb',
      chapters: 'Article sections',
      topicsNav: 'Blog topics',
      articleCount: (n) => (n === 1 ? '1 article' : `${n} articles`),
      inCategory: 'In this topic',
      moreTopics: 'Other topics',
      moreInTopic: 'More on this topic',
      dateLocale: 'en-US',
    },
    faqSoon: {
      title: 'Coming soon',
      text: 'We are preparing answers to our most common questions. In the meantime, message us on WhatsApp or visit our contact page.',
      contact: 'Contact',
    },
    empty: {
      soon: 'This section will be available soon.',
      notFound: 'The page you are looking for does not exist or has moved.',
      backHome: 'Back to Home',
    },
  },
  es: {
    skipLink: 'Saltar al contenido',
    mainNav: 'Principal',
    menu: 'Menú',
    scheduleShort: 'Agendar',
    scheduleRest: ' visita',
    logoAlt: (name) => `${name}, ir a Inicio`,
    opensNewTab: ' (se abre en una pestaña nueva)',
    opensMaps: ' (abre Google Maps en una pestaña nueva)',
    pauseAnimations: 'Pausar animaciones',
    socialLabel: 'Redes sociales',
    socialLink: (label, name) => `${label} de ${name} (se abre en una pestaña nueva)`,
    carousel: {
      role: 'carrusel',
      list: (label) => `Lista: ${label}`,
      prev: (label) => `Anterior: ${label}`,
      next: (label) => `Siguiente: ${label}`,
    },
    stars: { pending: 'Calificación pendiente', value: (rating) => `Calificación: ${rating} de 5` },
    map: { toggle: (name) => `Ubicación de ${name}`, hint: 'Toca para ver la ubicación', tag: 'Zona Río' },
    contact: {
      title: 'Contacto',
      address: 'Dirección',
      directions: 'Cómo llegar',
      email: 'Correo',
      hours: 'Horario',
      follow: 'Síguenos',
      call: 'Llamar al',
    },
    reviews: {
      summary: 'Resumen de calificaciones',
      pending: 'Calificación en Google',
      based: (total) => `Basado en ${total} reseñas de Google`,
      carousel: 'Reseñas de pacientes',
      more: 'Leer en Google',
    },
    featured: { carousel: 'Servicios más solicitados', cta: 'Conocer más del servicio', badge: 'Más solicitado' },
    rights: 'Todos los derechos reservados.',
    spin: {
      zoom: (alt) => `Ampliar foto: ${alt}`,
      prev: 'Foto anterior',
      next: 'Foto siguiente',
      expanded: (alt) => (alt ? `Foto ampliada: ${alt}` : 'Foto ampliada'),
      close: 'Cerrar foto ampliada',
    },
    service: {
      crumbs: 'Ruta de navegación',
      whatsapp: 'WhatsApp',
      book: 'Reservar cita',
      aboutEyebrow: 'Acerca del tratamiento',
      blogCta: 'Conocer más sobre este tratamiento',
    },
    blog: {
      explore: 'Explorar artículos',
      allServices: 'Ver todos los servicios',
      book: 'Agendar visita',
      minutes: (n) => `${n} min de lectura`,
      answer: 'Respuesta breve.',
      sources: 'Fuentes:',
      crumbs: 'Migas de pan',
      chapters: 'Secciones del artículo',
      topicsNav: 'Temas del blog',
      articleCount: (n) => (n === 1 ? '1 artículo' : `${n} artículos`),
      inCategory: 'En este tema',
      moreTopics: 'Otros temas',
      moreInTopic: 'Más de este tema',
      dateLocale: 'es-MX',
    },
    faqSoon: {
      title: 'Próximamente',
      text: 'Estamos preparando las respuestas a las dudas más comunes. Mientras tanto, escríbenos por WhatsApp o visita la página de contacto.',
      contact: 'Contacto',
    },
    empty: {
      soon: 'Esta sección estará disponible próximamente.',
      notFound: 'La página que buscas no existe o cambió de dirección.',
      backHome: 'Volver a Inicio',
    },
  },
}
