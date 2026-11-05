// ─────────────────────────────────────────────────────────────────────────────
// HOMEPAGE: arma la página de inicio con sus secciones, en el orden en que se ven.
//
// Para mover, quitar o agregar una sección, edita la lista de abajo.
// Cada sección vive en ./sections/ y sus textos en src/data/ (home.ts y otros).
// Estilos de las secciones: src/styles/pages/home/. Fondo compartido de toda la página: home/canvas.css.
// ─────────────────────────────────────────────────────────────────────────────

import { GlassLights } from '@/components/decor/GlassLights'
import { Hero } from '@/pages/home/sections/Hero'
import { SeccionDiente } from '@/pages/home/sections/SeccionDiente'
import { Schedule } from '@/pages/home/sections/Schedule'
import { Testimonials } from '@/pages/home/sections/Testimonials'
import { FeaturedServices } from '@/pages/home/sections/FeaturedServices'
import { Partners } from '@/pages/home/sections/Partners'
import { Reviews } from '@/pages/home/sections/Reviews'
import { ContactLocation } from '@/pages/home/sections/ContactLocation'

export function HomePage() {
  return (
    // Un solo fondo para toda la página (el degradado azul del hero, en App.tsx), fijo detrás de las secciones. Las
    // fibras de luz animadas van solo en el hero.
    <div className="home-canvas">
      <GlassLights gold="none" />
      {/* Primera pantalla, con las fibras de luz */}
      <Hero />
      {/* Tres mensajes animados con el scroll */}
      <SeccionDiente />
      {/* Agenda tu visita + formulario (id="agendar") */}
      <Schedule />
      {/* Testimonios de pacientes (solo si hay en src/data/testimonials.ts) */}
      <Testimonials />
      {/* Servicios destacados */}
      <FeaturedServices />
      {/* Aseguranzas y convenios */}
      <Partners />
      {/* Reseñas de Google */}
      <Reviews />
      {/* Contacto y ubicación (id="ubicacion") */}
      <ContactLocation />
    </div>
  )
}
