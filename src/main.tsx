// ─────────────────────────────────────────────────────────────────────────────
// PUNTO DE ENTRADA EN EL NAVEGADOR
//
// Carga los estilos globales y monta la aplicación (<App />) dentro de <div id="root">.
// • Si la página ya viene prerenderizada (HTML generado al compilar), solo la "hidrata":
//   React toma el HTML existente y le agrega la interactividad, sin volver a dibujarlo.
// • En desarrollo (npm run dev) no hay HTML previo: dibuja la página desde cero.
// ─────────────────────────────────────────────────────────────────────────────

import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { SCHEDULE_ANCHOR, findRoute, routeOf } from '@/config/routes'
import { applyHead } from '@/seo/head'
import { motionOff, pauseOffscreen } from '@/lib/motion'
import '@/styles/index.css'

// "Agendar" desde otra página llega a /…/#agendar: primero se ve el inicio y luego baja suave al formulario. El ancla no existe
// al cargar (la sección llega diferida o se hidrata), por eso se espera a que aparezca en lugar de confiar en el salto del navegador.
const scheduleId = window.location.hash.slice(1)
if (scheduleId === SCHEDULE_ANCHOR) {
  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
  let tries = 0
  const wait = window.setInterval(() => {
    const target = document.getElementById(scheduleId)
    if (!target && ++tries < 50) return
    window.clearInterval(wait)
    if (target) window.setTimeout(() => target.scrollIntoView({ behavior: motionOff() ? 'auto' : 'smooth' }), 700)
  }, 100)
}

const container = document.getElementById('root')!
const path = window.location.pathname
// "/" no es una página: va a la versión en inglés (en producción lo hace vercel.json; aquí, en desarrollo).
if (path === '/') window.location.replace(routeOf('home', 'en').path)
const route = findRoute(path)
const app = (
  <StrictMode>
    <App path={path} />
  </StrictMode>
)

if (container.dataset.path === route.path) {
  // HTML prerenderizado para esta ruta: solo se hidrata. Tras el primer cuadro pausa los contornos y brillos fuera de pantalla.
  hydrateRoot(container, app)
  requestAnimationFrame(pauseOffscreen)
} else {
  // Desarrollo (sin prerender) o una URL sin HTML propio.
  applyHead(route)
  createRoot(container).render(app)
  // La página diferida (React.lazy) llega después: pauseOffscreen la revisa sola cuando cambia el DOM.
  requestAnimationFrame(pauseOffscreen)
}
