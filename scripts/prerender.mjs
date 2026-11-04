// Prerender sencillo sin dependencias extra:
// 1. `vite build` genera el cliente en dist/.
// 2. `vite build --ssr` genera dist-server/entry-server.js.
// 3. Este script escribe el HTML estático de cada ruta, robots.txt y sitemap.xml.
//
// Por defecto el build es de VISTA PREVIA (todo noindex). Solo `npm run build:prod`
// (o SITE_ENV=production) genera páginas indexables y el sitemap.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const production = process.argv.includes('--production') || process.env.SITE_ENV === 'production'

const serverEntry = pathToFileURL(path.join(root, 'dist-server', 'entry-server.js')).href
const { render, lazySourceOf, ALL_ROUTES, NOT_FOUND, SITE, BOOKING, LOCALES, counterpart, routeOf } = await import(serverEntry)

// Seguro del formulario: el Apps Script valida al final, así que sus listas deben coincidir con las del sitio.
// Sin esto, cambiar SERVICES de config/booking.ts (u otras listas) sin actualizar Code.gs haría que el script rechace citas.
const codeGs = await fs.readFile(path.join(root, 'integrations', 'google-calendar', 'Code.gs'), 'utf8')
const gsList = (key) =>
  [...(codeGs.match(new RegExp(`${key}: \\[([^\\]]*)\\]`))?.[1] ?? '').matchAll(/'([^']*)'|(\d+)/g)].map(
    (match) => match[1] ?? Number(match[2]),
  )
const mismatches = [
  ['SERVICES', BOOKING.services],
  ['SLOTS', BOOKING.slots],
  ['CLOSED_WEEKDAYS', BOOKING.closedWeekdays],
]
  .filter(([key, list]) => JSON.stringify(gsList(key)) !== JSON.stringify(list))
  .map(([key]) => key)
if (codeGs.match(/DAYS_AHEAD: (\d+)/)?.[1] !== String(BOOKING.daysAhead)) mismatches.push('DAYS_AHEAD')
if (mismatches.length > 0) {
  throw new Error(`Code.gs no coincide con src/config/booking.ts en: ${mismatches.join(', ')}`)
}

const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8')
const HEAD_SLOT = '<!--app-head-->'
const APP_SLOT = '<div id="root"><!--app-html--></div>'
const LANG_ATTR = /<html lang="[^"]*"/
if (!template.includes(HEAD_SLOT) || !template.includes(APP_SLOT) || !LANG_ATTR.test(template)) {
  throw new Error('dist/index.html no contiene los marcadores del prerender (<!--app-head-->, #root y <html lang>).')
}

// Precarga de las fuentes latinas (titulares y texto) para evitar saltos tipográficos.
const assets = await fs.readdir(path.join(dist, 'assets'))
const fontPreloads = assets
  .filter((file) => /^(inter-latin-wght-normal|zilla-slab-latin-600-normal)-.+\.woff2$/.test(file))
  .map((file) => `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin />`)
if (fontPreloads.length === 0) {
  console.warn('AVISO: no se encontraron las fuentes latinas para precargar (¿cambió el nombre de los archivos de @fontsource?).')
}

// Paquetes de cada página diferida (React.lazy) con sus dependencias, desde el manifiesto de Vite: el navegador los pide junto
// con el paquete principal en vez de esperar a que este los descubra. El manifiesto no se publica.
const manifestPath = path.join(dist, '.vite', 'manifest.json')
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
const chunkFiles = (key, seen = new Set()) => {
  const entry = manifest[key]
  if (!entry || seen.has(key) || entry.isEntry) return []
  seen.add(key)
  return [entry.file, ...(entry.imports ?? []).flatMap((dep) => chunkFiles(dep, seen))]
}
const modulePreloads = (routePath) => {
  const source = lazySourceOf(routePath)
  if (!source) return []
  if (!manifest[source]) throw new Error(`Sin entrada en el manifiesto de Vite para ${source} (¿cambió LAZY_SOURCES en App.tsx?)`)
  // Sin repetir los que index.html ya precarga (paquetes compartidos con el principal).
  return chunkFiles(source).filter((file) => !template.includes(file)).map((file) => `<link rel="modulepreload" crossorigin href="/${file}" />`)
}

const written = []
for (const route of [...ALL_ROUTES, NOT_FOUND]) {
  const indexable = production && route.status === 'ready'
  // Sin descripción, head.ts emitiría og:description vacío en una página indexable.
  if (route.status === 'ready' && !route.description) throw new Error(`Ruta 'ready' sin description: ${route.path}`)
  const { html, head } = await render(route.path, { indexable })
  // Una página diferida que no terminó de cargar saldría vacía (o con un límite de Suspense pendiente) sin avisar.
  if (!html.includes('<h1') || html.includes('<!--$?-->')) throw new Error(`HTML incompleto en el prerender: ${route.path}`)
  // Una página con textos de marcador (lorem ipsum, "Texto provisional", "Integrante N", reseñas "Paciente N", promociones
  // y preguntas numeradas) no puede salir indexable. Los textos de las reseñas y promociones van en su idioma.
  const MARKER = /Lorem ipsum|Texto provisional|Integrante \d|Team member \d|Paciente \d|Patient \d|Aquí se mostrará|will appear here|Fecha de la reseña|Review date|Promoci[oó]n \d|Promotion \d|Pregunta \d|Question \d/
  if (indexable && MARKER.test(html)) {
    throw new Error(`Textos de marcador en una ruta indexable: ${route.path}. Cambia sus textos o déjala en status 'empty'.`)
  }
  const page = template
    // Cada página fija su idioma (en: "en"; es: "es-MX").
    .replace(LANG_ATTR, `<html lang="${LOCALES[route.lang].lang}"`)
    // Reemplazo con función: evita que "$&", "$'"… del contenido se interpreten como patrones.
    .replace(HEAD_SLOT, () => [head, ...fontPreloads, ...modulePreloads(route.path)].join('\n    '))
    .replace(APP_SLOT, () => `<div id="root" data-path="${route.path}">${html}</div>`)

  const file = route === NOT_FOUND ? path.join(dist, '404.html') : path.join(dist, route.path, 'index.html')
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, page)
  written.push(`${indexable ? 'index  ' : 'noindex'}  ${path.relative(dist, file).replaceAll('\\', '/')}`)
}

// "/" no es una página: dist/index.html pasa a ser una redirección a la versión en inglés (la principal), por si el
// hosting no aplica la redirección de vercel.json. Sin script del sitio ni contenido indexable.
const englishHome = routeOf('home', 'en').path
await fs.writeFile(
  path.join(dist, 'index.html'),
  `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Dental Nakeji</title>\n    <meta name="robots" content="noindex, follow" />\n    <link rel="canonical" href="${SITE.origin}${englishHome}" />\n    <meta http-equiv="refresh" content="0; url=${englishHome}" />\n  </head>\n  <body>\n    <a href="${englishHome}">Dental Nakeji</a>\n  </body>\n</html>\n`,
)

// Seguro de producción: un build de producción nunca debe salir con el homepage (en cada idioma) en noindex.
if (production) {
  for (const lang of ['en', 'es']) {
    const home = await fs.readFile(path.join(dist, routeOf('home', lang).path, 'index.html'), 'utf8')
    if (/name="robots" content="[^"]*noindex/.test(home)) {
      throw new Error(`Build de producción con el homepage (${lang}) en noindex: revisa buildHead / el status de la ruta 'home'.`)
    }
  }
}

// Redirecciones en vercel.json (campo "redirects"; Vercel no lee public/_redirects). Reglas:
//  • 301 (permanent true, statusCode 301) solo a una página 'ready'.
//  • Si el destino es 'empty', la redirección va a la portada de su idioma con 302 (provisional) hasta que la página real esté lista.
//  • Cada página en español (/es/slug/) debe tener su regla "slug/ → destino", y "/" debe ir a /en/ con 302. Si falta, el build falla.
const vercel = JSON.parse(await fs.readFile(path.join(root, 'vercel.json'), 'utf8'))
const redirects = vercel.redirects ?? []
const statusOf = (route) => ALL_ROUTES.find((r) => r.path === route)?.status
const codeOf = (rule) => rule.statusCode ?? (rule.permanent ? 301 : 302)
{
  const bySource = new Map(redirects.map((rule) => [rule.source, rule]))
  const missing = []
  for (const route of ALL_ROUTES.filter((r) => r.lang === 'es' && r.key !== 'home')) {
    const rule = bySource.get(route.path.replace(/^\/es/, ''))
    const ok =
      statusOf(route.path) === 'ready'
        ? rule?.destination === route.path && codeOf(rule) === 301
        : rule?.destination === routeOf('home', 'es').path && codeOf(rule) === 302
    if (!ok) missing.push(`${route.path.replace(/^\/es/, '')} -> ${route.path}`)
  }
  const englishHome = routeOf('home', 'en').path
  const rootRule = bySource.get('/')
  if (!rootRule || rootRule.destination !== englishHome || codeOf(rootRule) !== 302) missing.push(`/ -> ${englishHome} (302)`)
  if (missing.length > 0) throw new Error(`Faltan o son incorrectas redirecciones en vercel.json: ${missing.join(', ')}`)
}

// Candado de publicación: un 301 que apunta a una página no publicada ('empty') desindexaría la URL del sitio actual.
// Solo en producción; el build de vista previa no se ve afectado.
if (production) {
  const hidden = redirects.filter((rule) => codeOf(rule) === 301 && statusOf(rule.destination) !== 'ready')
  if (hidden.length > 0) {
    const list = hidden.map((rule) => `  ${rule.source} -> ${rule.destination}`).join('\n')
    throw new Error(
      `${hidden.length} redirecciones 301 en vercel.json apuntan a páginas no publicadas (status 'empty'); publicar así desindexaría el sitio actual:\n${list}`,
    )
  }
}

// robots.txt y sitemap.xml: solo las páginas reales y terminadas.
// Sin <lastmod>: la fecha del build no es la de la última modificación y daría una señal falsa a Google.
const sitemapFile = path.join(dist, 'sitemap.xml')
if (production) {
  // Ambas versiones de cada página 'ready', cada una con su pareja (hreflang) y x-default hacia la versión en inglés.
  const alternate = (hreflang, target) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${SITE.origin}${target.path}" />`
  const urls = ALL_ROUTES.filter((route) => route.status === 'ready')
    .map((route) => {
      const other = counterpart(route)
      const links = [
        alternate(LOCALES[route.lang].lang, route),
        alternate(LOCALES[other.lang].lang, other),
        alternate('x-default', routeOf(route.key, 'en')),
      ].join('\n')
      return `  <url>\n    <loc>${SITE.origin}${route.path}</loc>\n${links}\n  </url>`
    })
    .join('\n')
  await fs.writeFile(
    sitemapFile,
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
  )
  await fs.writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`)
} else {
  await fs.rm(sitemapFile, { force: true })
  await fs.writeFile(path.join(dist, 'robots.txt'), '# Vista previa: no indexar.\nUser-agent: *\nDisallow: /\n')
}

console.log(`\nPrerender (${production ? 'PRODUCCIÓN' : 'vista previa, todo noindex'}):`)
console.log(written.map((line) => `  ${line}`).join('\n'))
// El manifiesto solo le sirve al prerender: no se publica.
await fs.rm(path.join(dist, '.vite'), { recursive: true, force: true })
console.log(production ? '  + robots.txt, sitemap.xml\n' : '  + robots.txt (Disallow), sin sitemap\n')
