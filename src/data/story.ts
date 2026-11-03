// ─────────────────────────────────────────────────────────────────────────────
// TEXTOS DE LA SECCIÓN ANIMADA DEBAJO DEL HERO (componente: pages/home/sections/SeccionDiente.tsx)
//
// Tres mensajes que se leen al bajar. Cada frase es una lista de líneas, y cada línea una lista de
// fragmentos; `accent: true` resalta el fragmento con el azul de la marca.
//   1. desire   → entra desde la izquierda.
//   2. priority → sube desde abajo y queda centrado.
//   3. decision → entra desde la derecha.
// Los tres mensajes son generales: no prometen resultados, técnicas ni procesos concretos, ni afirman datos de la clínica
// (las frases verificables, como "Dentistas certificados", están en HERO.highlights de data/home.ts).
// Para que la animación se vea igual conviene mantener el largo parecido: ~8 palabras en los mensajes 1 y 3, ~11 en el 2.
// ─────────────────────────────────────────────────────────────────────────────

import type { Lang } from '@/config/routes'

interface StorySegment {
  text: string
  accent?: boolean
  /** Texto cuyo ancho se deja en blanco antes del fragmento: la línea empieza justo debajo de esas palabras. */
  indent?: string
}

export type StoryLines = StorySegment[][]

type StoryMessages = Record<'desire' | 'priority' | 'decision', StoryLines>

export const STORY: Record<Lang, StoryMessages> = {
  en: {
    desire: [
      [{ text: 'Caring for our patients with dedication and warmth' }],
      [{ text: 'A story dedicated to oral care.', accent: true }],
    ],
    priority: [
      [{ text: 'All dental specialties and a dental laboratory', accent: true }],
      [{ text: 'To care for every detail of your treatment in one place' }],
    ],
    decision: [
      [{ text: 'Dental care in Tijuana for patients from all over the world' }],
      [{ text: 'Meet Nakeji in Zona Río', accent: true }],
    ],
  },
  es: {
    // Sin puntos finales: las frases se leen como un hilo, no como oraciones sueltas.
    desire: [
      [{ text: 'Acompañando a nuestros pacientes con dedicación y calidez' }],
      [{ text: 'Una historia dedicada a la atención bucal.', accent: true }],
    ],
    priority: [
      [{ text: 'Todas las especialidades dentales y laboratorio dental', accent: true }],
      [{ text: 'Para cuidar cada detalle de tu tratamiento en un solo lugar' }],
    ],
    decision: [
      [{ text: 'Atención dental en Tijuana para pacientes de todo el mundo' }],
      [{ text: 'Conoce a Nakeji en Zona Río', accent: true }],
    ],
  },
}
