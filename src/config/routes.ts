// Rutas del sitio, en dos idiomas: inglés bajo /en/ (principal) y español bajo /es/.
// Cada página tiene una clave estable (`key`) y una ruta por idioma; el código busca por clave (`routeOf`),
// nunca por path. Las URLs en español conservan los slugs del sitio actual (nakejidental.com), que
// vercel.json redirige (301 si la página está lista; 302 a la portada si no) a su par en /es/.
//
// status:
//  - 'ready': página terminada → indexable y en el sitemap.
//  - 'empty': destino preparado sin contenido → noindex y fuera del sitemap.
//
// TEXTOS: ya están en inglés el homepage, el menú y el footer (paso 2), la lista de servicios (solo el nombre) y las páginas de
// beneficios, contacto, nosotros y preguntas frecuentes (solo nombre y SEO; su contenido sigue en español hasta el paso 4).
// Servicios (paso 3): nombre, título y descripción SEO ya están en inglés (la clínica debe confirmarlos antes de publicar).
// Para traducir otra página, separa su `text` en { en, es } dentro de `page(...)` (ver PAGES).

import blogContent from '@/data/blog-content.json'
import blogContentEn from '@/data/blog-content.en.json'

export type Lang = 'en' | 'es'
export const LANGS: Lang[] = ['en', 'es']

type RouteStatus = 'ready' | 'empty'

export type ServiceKey =
  | 'implants'
  | 'all-on-4'
  | 'all-on-6'
  | 'crowns'
  | 'veneers'
  | 'whitening'
  | 'cleaning'
  | 'root-canal'
  | 'orthodontics'
  | 'aligners'
  | 'pediatric'
  | 'dentures'
  | 'gum'
  | 'extractions'

export type RouteKey =
  | 'home'
  | 'services'
  | 'benefits'
  | 'promotions'
  | 'agreements'
  | 'insurance'
  | 'contact'
  | 'about'
  | 'blog'
  | 'privacy'
  | 'terms'
  | 'faq'
  | 'notFound'
  | ServiceKey
  /** Categoría o artículo del blog: `blog:<slug>` (ver BLOG_PAGES). */
  | `blog:${string}`

export interface RouteDef {
  key: RouteKey
  lang: Lang
  path: string
  label: string
  title: string
  description?: string
  status: RouteStatus
  /** 'service': se dibuja con la plantilla de servicio (textos en src/data/services.ts). */
  /** 'blog': hub, categorías y artículos del blog (src/pages/blog/BlogRoute.tsx). */
  template?: 'service' | 'blog'
}

interface Text {
  label: string
  title: string
  description?: string
}

interface PageDef {
  key: RouteKey
  paths: Record<Lang, string>
  text: Record<Lang, Text>
  status: RouteStatus
  template?: 'service' | 'blog'
}

/**
 * Página en ambos idiomas. `text` puede ser un solo Text (el mismo en los dos idiomas: provisional en /en/ hasta traducirla)
 * o { en, es }. Por defecto 'ready' (indexable y en el sitemap); una página con textos de ejemplo va con { status: 'empty' }.
 */
const page = (
  key: RouteKey,
  paths: Record<Lang, string>,
  text: Text | Record<Lang, Text>,
  extra: { status?: RouteStatus; template?: 'service' | 'blog' } = {},
): PageDef => ({
  key,
  paths,
  text: 'label' in text ? { en: text, es: text } : text,
  status: 'ready',
  ...extra,
})

/** Título y descripción SEO en inglés de cada servicio (glosario: gan-harness/glosario-en.md). La clínica debe confirmarlos antes de publicar. */
const SERVICE_SEO_EN: Record<ServiceKey, { title: string; description: string }> = {
  implants: {
    title: 'Dental implants in Tijuana | Dental Nakeji',
    description:
      'Learn about dental implants in Tijuana: what they are and when they are recommended. Schedule an evaluation at Dental Nakeji, Zona Río.',
  },
  'all-on-4': {
    title: 'All-on-4 implants in Tijuana | Dental Nakeji',
    description: 'All-on-4 in Tijuana: an option to replace a full arch of teeth. Schedule an evaluation at Dental Nakeji, Zona Río.',
  },
  'all-on-6': {
    title: 'All-on-6 implants in Tijuana | Dental Nakeji',
    description:
      'All-on-6 in Tijuana: an option to replace a full arch with more support points. Schedule an evaluation at Dental Nakeji.',
  },
  crowns: {
    title: 'Dental crowns in Tijuana | Dental Nakeji',
    description: 'Dental crowns in Tijuana to protect and restore damaged teeth. Schedule an evaluation at Dental Nakeji, Zona Río.',
  },
  veneers: {
    title: 'Veneers in Tijuana | Dental Nakeji',
    description:
      'Dental veneers in Tijuana to improve the shape and color of your smile. Schedule an evaluation at Dental Nakeji, Zona Río.',
  },
  whitening: {
    title: 'Teeth whitening in Tijuana | Dental Nakeji',
    description: 'Teeth whitening in Tijuana, with an evaluation at the clinic first. Schedule your visit at Dental Nakeji, Zona Río.',
  },
  cleaning: {
    title: 'Dental cleaning in Tijuana | Dental Nakeji',
    description: 'Dental cleaning in Tijuana to care for your teeth and gums. Schedule your visit at Dental Nakeji, Zona Río.',
  },
  'root-canal': {
    title: 'Root canal treatment in Tijuana | Dental Nakeji',
    description:
      'Root canal treatment in Tijuana to care for the inside of the tooth. Schedule an evaluation at Dental Nakeji, Zona Río.',
  },
  orthodontics: {
    title: 'Orthodontics in Tijuana | Dental Nakeji',
    description:
      'Orthodontics in Tijuana with braces or aligners, depending on your case. Schedule an evaluation at Dental Nakeji, Zona Río.',
  },
  aligners: {
    title: 'Clear aligners in Tijuana | Dental Nakeji',
    description: 'Clear aligners in Tijuana to align your teeth. Schedule an evaluation at Dental Nakeji, Zona Río.',
  },
  pediatric: {
    title: 'Pediatric dentistry in Tijuana | Dental Nakeji',
    description:
      'Pediatric dentistry in Tijuana: dental care for children. Schedule your child’s visit at Dental Nakeji, Zona Río.',
  },
  dentures: {
    title: 'Dentures in Tijuana | Dental Nakeji',
    description: 'Dentures in Tijuana to replace missing teeth. Schedule an evaluation at Dental Nakeji, Zona Río.',
  },
  gum: {
    title: 'Gum treatment in Tijuana | Dental Nakeji',
    description:
      'Periodontal treatment in Tijuana: care for your gums and the tissues that support your teeth. Schedule an evaluation at Dental Nakeji, Zona Río.',
  },
  extractions: {
    title: 'Tooth extractions in Tijuana | Dental Nakeji',
    description:
      'Simple and wisdom tooth extractions in Tijuana, with an evaluation first. Schedule your visit at Dental Nakeji, Zona Río.',
  },
}

/** Nombre del servicio en inglés (menú, footer, migas); según gan-harness/glosario-en.md. */
const SERVICE_LABEL_EN: Record<ServiceKey, string> = {
  implants: 'Dental implants',
  'all-on-4': 'All-on-4 implants',
  'all-on-6': 'All-on-6 implants',
  crowns: 'Dental crowns',
  veneers: 'Veneers',
  whitening: 'Teeth whitening',
  cleaning: 'Dental cleaning',
  'root-canal': 'Root canal',
  orthodontics: 'Orthodontics',
  aligners: 'Clear aligners',
  pediatric: 'Pediatric dentistry',
  dentures: 'Dentures',
  gum: 'Gum treatment',
  extractions: 'Tooth extractions',
}

const withTitle = (label: string, seo: Partial<Text> = {}): Text => ({ label, title: `${label} | Dental Nakeji`, ...seo })

/**
 * Página de servicio con la plantilla (hero + información + agenda).
 * Indexable ('ready', el valor por defecto de page) y en el sitemap.
 * El slug en español es el del sitio actual; el de inglés es nuevo.
 */
const service = (key: ServiceKey, es: string, en: string, label: string, seo: { title: string; description: string }): PageDef =>
  page(
    key,
    { en: `/en/${en}/`, es: `/es/${es}/` },
    { es: { label, ...seo }, en: { label: SERVICE_LABEL_EN[key], ...SERVICE_SEO_EN[key] } },
    { template: 'service' },
  )

/**
 * Servicios con página propia, de mayor a menor relevancia (los 11 primeros fueron los del submenú en 3 columnas).
 * El menú de Servicios usa 9 de ellos: ver MENU_SERVICE_KEYS en config/navigation.ts.
 * Prioridad acordada con los doctores + búsquedas más frecuentes (implantes, carillas, coronas).
 */
export const SERVICE_KEYS: ServiceKey[] = [
  // Columna 1: implantes y rehabilitación (lo más solicitado)
  'implants',
  'all-on-4',
  'all-on-6',
  'crowns',
  // Columna 2: estética y prevención
  'veneers',
  'whitening',
  'cleaning',
  // Columna 3: tratamientos y especialidades
  'root-canal',
  'orthodontics',
  'aligners',
  'pediatric',
]

/**
 * Servicios con página propia que NO van en el submenú pero sí en la página /servicios/ y en el
 * formulario de citas. Mismo orden de prioridad: de mayor a menor.
 */
export const MORE_SERVICE_KEYS: ServiceKey[] = ['dentures', 'gum', 'extractions']

/** Los 14, en orden. */
export const ALL_SERVICE_KEYS: ServiceKey[] = [...SERVICE_KEYS, ...MORE_SERVICE_KEYS]

/** Par en inglés de una categoría o artículo del blog (blog-content.en.json lo marca con `key`, el slug en español). */
function blogPairEn<T extends { key: string }>(list: T[], key: string): T {
  const pair = list.find((item) => item.key === key)
  if (!pair) throw new Error(`Falta la traducción al inglés del blog (src/data/blog-content.en.json): ${key}`)
  return pair
}

/**
 * Categorías (5) y artículos (14) del blog, con los textos de src/data/blog-content.json y su traducción en blog-content.en.json.
 * La clave (`blog:<slug en español>`) es la misma en los dos idiomas. Son 'ready' (indexables).
 */
const BLOG_PAGES: PageDef[] = [
  ...blogContent.categories.map((c) => {
    const key = c.route.split('/').at(-2) ?? ''
    const en = blogPairEn(blogContentEn.categories, key)
    return page(
      `blog:${key}`,
      { en: en.route, es: c.route },
      { en: withTitle(en.name, { description: en.description }), es: withTitle(c.name, { description: c.description }) },
      { template: 'blog' },
    )
  }),
  ...blogContent.articles.map((a) => {
    const key = a.route.split('/').at(-2) ?? ''
    const en = blogPairEn(blogContentEn.articles, key)
    const excerptOf = (content: typeof blogContent, route: string) => content.cards.find((card) => card.route === route)?.excerpt
    return page(
      `blog:${key}`,
      { en: en.route, es: a.route },
      {
        en: withTitle(en.title, { description: excerptOf(blogContentEn, en.route) }),
        es: withTitle(a.title, { description: excerptOf(blogContent, a.route) }),
      },
      { template: 'blog' },
    )
  }),
]

const PAGES: PageDef[] = [
  page(
    'home',
    { en: '/en/', es: '/es/' },
    {
      en: {
        label: 'Home',
        title: 'Dentists in Tijuana | Dental Nakeji',
        description:
          'Dental clinic in Zona Río, Tijuana. Dental implants, crowns, veneers, teeth whitening, orthodontics and more. Schedule your visit on WhatsApp.',
      },
      es: {
        label: 'Inicio',
        title: 'Dentistas en Tijuana | Clínica Dental Nakeji',
        description:
          'Clínica dental en la Zona Río de Tijuana. Implantes dentales, coronas, carillas, blanqueamiento, ortodoncia y más. Agenda tu visita por WhatsApp.',
      },
    },
    { status: 'ready' },
  ),
  page('services', { en: '/en/services/', es: '/es/servicios/' }, {
    en: {
      label: 'Services',
      title: 'Dental services in Tijuana | Dental Nakeji',
      description:
        'Dental implants, crowns, veneers, teeth whitening, orthodontics, cleaning, root canal and more in Tijuana. Learn about each treatment at Dental Nakeji.',
    },
    es: withTitle('Servicios', {
      title: 'Servicios dentales en Tijuana | Dental Nakeji',
      description:
        'Implantes, coronas, carillas, blanqueamiento, ortodoncia, limpieza, endodoncia y más servicios dentales en Tijuana. Conoce cada tratamiento en Dental Nakeji.',
    }),
  }),
  // Página /beneficios/: promociones, convenios y aseguranzas en una sola página (pages/benefits/BenefitsPage.tsx).
  page('benefits', { en: '/en/benefits/', es: '/es/beneficios/' }, {
    en: withTitle('Benefits', {
      description:
        'Promotions, partner-company agreements and US dental insurance at Dental Nakeji, Tijuana. Clear options to care for your teeth without overspending.',
    }),
    es: withTitle('Beneficios', {
      description:
        'Promociones, convenios con empresas y aseguranzas americanas en Dental Nakeji, Tijuana. Te explicamos tus opciones para que cuides tu salud dental sin gastar de más.',
    }),
  }),
  // Submenú de Beneficios. /convenios/ es nueva; las otras dos ya existen.
  // Promociones sigue en 'empty' mientras sus tarjetas sean de ejemplo ("Promoción 1", "Vigencia por definir").
  page(
    'promotions',
    { en: '/en/promotions/', es: '/es/nuestras-promociones/' },
    { en: withTitle('Promotions'), es: withTitle('Promociones') },
    { status: 'empty' },
  ),
  page('agreements', { en: '/en/agreements/', es: '/es/convenios/' }, {
    en: withTitle('Partner companies', {
      description:
        'Dental agreements for companies in Tijuana. Does your company have one with Dental Nakeji, or want one? Message us and we will go over the options together.',
    }),
    es: withTitle('Convenios', {
      description:
        'Convenios dentales para empresas en Tijuana. ¿Tu empresa tiene o quiere un convenio con Dental Nakeji? Escríbenos y revisamos juntos las opciones.',
    }),
  }),
  page('insurance', { en: '/en/insurance/', es: '/es/insurance/' }, {
    en: withTitle('Insurance', {
      description:
        'Dental Nakeji in Tijuana accepts US dental insurance plans. See the plans we accept and contact us before your appointment to answer your questions.',
    }),
    es: withTitle('Aseguranzas', {
      description:
        'Dental Nakeji en Tijuana acepta aseguranzas dentales americanas. Consulta las aseguranzas que aceptamos y escríbenos antes de tu cita para resolver tus dudas.',
    }),
  }),

  service('implants', 'implantes-dentales-en-tijuana', 'dental-implants-in-tijuana', 'Implantes dentales', {
    title: 'Implantes dentales en Tijuana | Dental Nakeji',
    description:
      'Conoce los implantes dentales en Tijuana: qué son y cuándo se recomiendan. Agenda una valoración en Dental Nakeji, Zona Río.',
  }),
  service('all-on-4', 'all-in-4-implants-en-tijuana', 'all-on-4-implants-in-tijuana', 'All on 4 implants', {
    title: 'All on 4 Implants en Tijuana | Dental Nakeji',
    description:
      'All on 4 en Tijuana: una opción para reemplazar una arcada completa de dientes. Agenda una valoración en Dental Nakeji, Zona Río.',
  }),
  service('all-on-6', 'all-in-6-implants-en-tijuana', 'all-on-6-implants-in-tijuana', 'All on 6 implants', {
    title: 'All on 6 Implants en Tijuana | Dental Nakeji',
    description:
      'All on 6 en Tijuana: una opción para reemplazar una arcada completa con más puntos de apoyo. Agenda una valoración en Dental Nakeji.',
  }),
  service('crowns', 'coronas-en-tijuana', 'dental-crowns-in-tijuana', 'Coronas', {
    title: 'Coronas dentales en Tijuana | Dental Nakeji',
    description:
      'Coronas dentales en Tijuana para proteger y restaurar dientes dañados. Agenda una valoración en Dental Nakeji, Zona Río.',
  }),
  service('veneers', 'carillasdentalesentijuana', 'dental-veneers-in-tijuana', 'Carillas dentales', {
    title: 'Carillas dentales en Tijuana | Dental Nakeji',
    description:
      'Carillas dentales en Tijuana para mejorar la forma y el color de tu sonrisa. Agenda una valoración en Dental Nakeji, Zona Río.',
  }),
  service('whitening', 'blanqueamiento-dental-en-tijuana', 'teeth-whitening-in-tijuana', 'Blanqueamiento dental', {
    title: 'Blanqueamiento dental en Tijuana | Dental Nakeji',
    description:
      'Blanqueamiento dental en Tijuana, con valoración previa en la clínica. Agenda tu visita en Dental Nakeji, Zona Río.',
  }),
  service('cleaning', 'limpieza-dental-en-tijuana', 'dental-cleaning-in-tijuana', 'Limpieza dental', {
    title: 'Limpieza dental en Tijuana | Dental Nakeji',
    description:
      'Limpieza dental en Tijuana para el cuidado de tus dientes y encías. Agenda tu visita en Dental Nakeji, Zona Río.',
  }),
  service('root-canal', 'endodoncias-en-tijuana', 'root-canal-in-tijuana', 'Endodoncias', {
    title: 'Endodoncias en Tijuana | Dental Nakeji',
    description:
      'Endodoncias en Tijuana: tratamiento de conductos para atender el interior del diente. Agenda una valoración en Dental Nakeji, Zona Río.',
  }),
  service('orthodontics', 'ortodoncia-en-tijuana', 'orthodontics-in-tijuana', 'Ortodoncia', {
    title: 'Ortodoncia en Tijuana | Dental Nakeji',
    description:
      'Ortodoncia en Tijuana con brackets o alineadores, según tu caso. Agenda una valoración en Dental Nakeji, Zona Río.',
  }),
  // La URL en español conserva "invisalign" (es la del sitio actual); el nombre visible ya no lleva la marca.
  service('aligners', 'invisalign-in-tijuana', 'clear-aligners-in-tijuana', 'Alineadores', {
    title: 'Alineadores transparentes en Tijuana | Dental Nakeji',
    description:
      'Alineadores transparentes en Tijuana para alinear tus dientes. Agenda una valoración en Dental Nakeji, Zona Río.',
  }),
  service('pediatric', 'odontologia-pediatrica-en-tijuana', 'pediatric-dentistry-in-tijuana', 'Odontopediatría', {
    title: 'Odontopediatría en Tijuana | Dental Nakeji',
    description:
      'Odontopediatría en Tijuana: cuidado dental para niños. Agenda la visita de tu hijo en Dental Nakeji, Zona Río.',
  }),
  service('dentures', 'dentaduras-en-tijuana', 'dentures-in-tijuana', 'Dentaduras', {
    title: 'Dentaduras en Tijuana | Dental Nakeji',
    description:
      'Dentaduras en Tijuana para reemplazar dientes faltantes. Agenda una valoración en Dental Nakeji, Zona Río.',
  }),
  service('gum', 'periodoncia-en-tijuana', 'gum-treatment-in-tijuana', 'Periodoncia', {
    title: 'Periodoncia en Tijuana | Dental Nakeji',
    description:
      'Periodoncia en Tijuana: atención de las encías y del soporte de tus dientes. Agenda una valoración en Dental Nakeji, Zona Río.',
  }),
  service('extractions', 'extracciones-dentales-en-tijuana', 'tooth-extractions-in-tijuana', 'Extracciones simples y de juicio', {
    title: 'Extracciones dentales en Tijuana | Dental Nakeji',
    description:
      'Extracciones simples y de muelas del juicio en Tijuana, con valoración previa. Agenda tu visita en Dental Nakeji, Zona Río.',
  }),

  page(
    'contact',
    { en: '/en/contact/', es: '/es/contacto/' },
    {
      en: withTitle('Contact', {
        title: 'Contact and location | Dental Nakeji, Zona Río Tijuana',
        description:
          'Call, message or visit Dental Nakeji in Zona Río, Tijuana. Phone numbers for Mexico and the United States, address and email. Schedule your appointment.',
      }),
      es: withTitle('Contacto', {
        title: 'Contacto y ubicación | Dental Nakeji, Zona Río Tijuana',
        description:
          'Llama, escribe o visita Dental Nakeji en la Zona Río de Tijuana. Teléfonos de México y Estados Unidos, dirección y correo. Agenda tu cita.',
      }),
    },
  ),
  page(
    'about',
    { en: '/en/about/', es: '/es/nosotros/' },
    {
      en: withTitle('About us', {
        title: 'About us | Dental Nakeji, Zona Río Tijuana',
        description:
          'Learn about the history, mission and vision of Dental Nakeji in Tijuana, and meet the doctors and staff who will care for you.',
      }),
      es: withTitle('Nosotros', {
        title: 'Nosotros | Dental Nakeji, Zona Río Tijuana',
        description: 'Conoce la historia, la misión y la visión de Dental Nakeji en Tijuana, y al equipo de doctores y personal que te atiende.',
      }),
    },
  ),
  page(
    'blog',
    { en: '/en/blog/', es: '/es/blog/' },
    {
      en: withTitle('Blog', {
        title: 'Dental health blog | Dental Nakeji, Tijuana',
        description:
          'Clear answers about caring for your teeth and gums and about the treatments at Dental Nakeji in Tijuana: implants, crowns, orthodontics, cleaning and more.',
      }),
      es: withTitle('Blog', {
        title: 'Blog de salud dental | Dental Nakeji, Tijuana',
        description:
          'Respuestas claras sobre el cuidado de dientes y encías y sobre los tratamientos de Dental Nakeji en Tijuana: implantes, coronas, ortodoncia, limpieza y más.',
      }),
    },
    { template: 'blog' },
  ),
  ...BLOG_PAGES,
  // Requerido por el formulario de citas (LFPDPPP). Textos en src/data/legal.ts.
  page(
    'privacy',
    { en: '/en/privacy/', es: '/es/aviso-de-privacidad/' },
    {
      en: withTitle('Privacy Notice', {
        description:
          'Dental Nakeji Privacy Notice: what data we collect, why we use it, who we share it with, and how to exercise your rights.',
      }),
      es: withTitle('Aviso de privacidad', {
        description:
          'Aviso de privacidad de Dental Nakeji: qué datos recabamos, para qué los usamos, con quién los compartimos y cómo ejercer tus derechos.',
      }),
    },
  ),
  page(
    'terms',
    { en: '/en/terms/', es: '/es/terminos-y-condiciones/' },
    {
      en: withTitle('Terms and Conditions', {
        description: 'Dental Nakeji Terms and Conditions: appointment requests, payments, insurance, messages, and use of the site.',
      }),
      es: withTitle('Términos y condiciones', {
        description: 'Términos y condiciones de Dental Nakeji: solicitudes de cita, pagos, seguros, mensajes y uso del sitio.',
      }),
    },
  ),
  page(
    'faq',
    { en: '/en/faq/', es: '/es/preguntas-frecuentes/' },
    {
      en: withTitle('FAQ', {
        title: 'Frequently asked questions | Dental Nakeji, Tijuana',
        description: 'Answers to common questions about appointments, treatments, payments and insurance at Dental Nakeji.',
      }),
      es: withTitle('Preguntas frecuentes', {
        title: 'Preguntas frecuentes | Dental Nakeji, Tijuana',
        description: 'Respuestas a las dudas más comunes sobre citas, tratamientos, pagos y aseguranzas en Dental Nakeji.',
      }),
    },
  ),
]

export const ALL_ROUTES: RouteDef[] = PAGES.flatMap((def) =>
  LANGS.map((lang) => ({
    key: def.key,
    lang,
    path: def.paths[lang],
    ...def.text[lang],
    status: def.status,
    template: def.template,
  })),
)

/** Página 404: una sola (dist/404.html); su idioma, en el navegador, es el de la URL pedida (ver findRoute). */
export const NOT_FOUND: RouteDef = {
  key: 'notFound',
  lang: 'en',
  path: '/404/',
  label: 'Page not found',
  title: 'Page not found | Dental Nakeji',
  status: 'empty',
}

const NOT_FOUND_ES: RouteDef = {
  ...NOT_FOUND,
  lang: 'es',
  label: 'Página no encontrada',
  title: 'Página no encontrada | Dental Nakeji',
}

const BY_KEY = new Map<string, RouteDef>(
  [...ALL_ROUTES, NOT_FOUND, NOT_FOUND_ES].map((route) => [`${route.key}:${route.lang}`, route]),
)

/** La ruta de una página en un idioma, buscada por su clave. */
export function routeOf(key: RouteKey, lang: Lang): RouteDef {
  const route = BY_KEY.get(`${key}:${lang}`)
  if (!route) throw new Error(`Ruta sin definir: ${key} (${lang})`)
  return route
}

/** La misma página en el otro idioma (botón de idioma y hreflang). El 404 no tiene URL propia: su par es el inicio. */
export const counterpart = (route: RouteDef): RouteDef =>
  routeOf(route.key === 'notFound' ? 'home' : route.key, route.lang === 'en' ? 'es' : 'en')

/** Idioma de una URL por su prefijo (/es/…); cualquier otra cosa es inglés, el idioma principal. */
export const langOfPath = (pathname: string): Lang => (pathname.startsWith('/es/') ? 'es' : 'en')

/** Normaliza la ruta: sin "index.html" y siempre con "/" final (igual que el sitio actual). */
function normalizePath(pathname: string): string {
  const clean = (pathname.split(/[?#]/)[0] || '/').replace(/\/index\.html$/, '/')
  return clean.endsWith('/') ? clean : `${clean}/`
}

export function findRoute(pathname: string): RouteDef {
  const path = normalizePath(pathname)
  return ALL_ROUTES.find((r) => r.path === path) ?? routeOf('notFound', langOfPath(path))
}

/** El botón "Agendar visita" baja al módulo de agenda (homepage y páginas de servicio). */
export const SCHEDULE_ANCHOR = 'agendar'

/** Enlace a la agenda: ancla local si la página tiene agenda; si no, la del homepage de su idioma. */
export const scheduleHref = (route: RouteDef) =>
  route.key === 'home' || route.template === 'service' ? `#${SCHEDULE_ANCHOR}` : `${routeOf('home', route.lang).path}#${SCHEDULE_ANCHOR}`

/** Valor de aria-current para un enlace interno. */
export const ariaCurrent = (href: string, currentPath: string) => (href === currentPath ? 'page' : undefined)
