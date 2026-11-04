// ─────────────────────────────────────────────────────────────────────────────
// FOTOS DEL "SPIN SHUTTER" de /servicios/ (components/ui/SpinShutter.tsx, a la derecha de las cartas de categorías).
// Son solo fotos (sin título, texto ni enlaces): fotos de las instalaciones y el equipo de la clínica, de su Instagram
// (public/images/clinica/; 12 fotos llenan bien el anillo).
// ─────────────────────────────────────────────────────────────────────────────

import type { Lang } from '@/config/routes'

export interface ShowcasePhoto {
  src: string
  alt: string
  /** object-position de la foto dentro de la tarjeta (qué parte queda visible al recortar). */
  position: string
}

/** Nombre de la galería para lectores de pantalla (el anillo no lleva título visible). */
export const SHOWCASE_LABEL: Record<Lang, string> = { en: 'Photo gallery', es: 'Galería de fotos' }

const photo = (file: string, alt: Record<Lang, string>, position = 'center'): Record<Lang, ShowcasePhoto> => {
  const src = `/images/clinica/${file}.jpg`
  return { en: { src, alt: alt.en, position }, es: { src, alt: alt.es, position } }
}

const PHOTOS = [
  // Solo fotos (no portadas de video) de personas, sin texto ni publicidad, publicadas de mayo de 2025 en adelante.
  // Las dos primeras (uniforme azul, el actual) venían con los teléfonos encima: se guardaron recortadas sin esa parte.
  photo('doctora-uniforme-azul', { en: 'Dentist at work', es: 'Dentista en consulta' }),
  photo('doctor-tratamiento', { en: 'Dentist treating a patient', es: 'Dentista atendiendo a un paciente' }),
  photo('equipo-paciente', { en: 'Our team with a patient', es: 'Nuestro equipo con un paciente' }, 'center 30%'),
  photo('doctora-atendiendo', { en: 'Dentist caring for a patient', es: 'Dentista atendiendo a una paciente' }, 'center 40%'),
  photo('doctor-atendiendo', { en: 'Dentist treating a patient', es: 'Dentista atendiendo a un paciente' }, 'center 40%'),
]

export const SHOWCASE_PHOTOS: Record<Lang, ShowcasePhoto[]> = {
  en: PHOTOS.map((item) => item.en),
  es: PHOTOS.map((item) => item.es),
}
