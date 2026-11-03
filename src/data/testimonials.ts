import type { Lang } from '@/config/routes'
import { SITE } from '@/config/site'

export interface Testimonial {
  name: string
  /** Tratamiento que recibió, por idioma (opcional). */
  treatment?: Record<Lang, string>
  /** La cita del paciente: `es` es el texto original; `en` es una traducción. */
  quote: Record<Lang, string>
  /** 1 a 5; sin valor (null) no se dibujan estrellas. */
  rating: number | null
  /** De dónde viene: 'google' muestra "Reseña de Google" bajo el nombre. */
  source?: 'google'
}

export const TESTIMONIALS_SECTION: Record<
  Lang,
  { title: string; text: string; list: string; video: string; googleReview: string; seeAll: string }
> = {
  es: {
    title: 'Lo que dicen nuestros pacientes',
    text: 'Historias reales de personas que confiaron su sonrisa a Dental Nakeji.',
    list: 'Testimonios de pacientes',
    video: 'Video testimonio de Dental Nakeji',
    googleReview: 'Reseña de Google',
    seeAll: 'Ver todas las reseñas en Google',
  },
  en: {
    title: 'What our patients say',
    text: 'Real stories from people who trusted Dental Nakeji with their smile.',
    list: 'Patient testimonials',
    video: 'Dental Nakeji video testimonial',
    googleReview: 'Google review',
    seeAll: 'See all reviews on Google',
  },
}

/** Enlace a las reseñas en Google (perfil de la clínica en Maps). */
export const TESTIMONIALS_GOOGLE_URL = SITE.address.mapsUrl

/**
 * Video vertical (9:16, 720×1280) de la columna izquierda: public/videos/testimonio-dental-nakeji.mp4.
 * Sin `src`, la sección muestra solo las tarjetas.
 */
export const TESTIMONIAL_VIDEO: { src: string } = {
  src: '/videos/testimonio-dental-nakeji.mp4',
}

// Tres reseñas reales de Google (perfil Dental Nakeji, 3 nov 2026), copiadas tal cual; en inglés, traducción.
// Máximo 3 (se muestran las 3 primeras). Para cambiarlas, edita esta lista.
export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Greg Person',
    quote: {
      es: 'Nakeji Dental fue una excelente experiencia de principio a fin. Todo el equipo fue muy amable, cálido y profesional. Cada paso del proceso dental fue explicado claramente, lo que hizo que la experiencia fuera cómoda y fácil de entender.',
      en: 'Nakeji Dental was an excellent experience from start to finish. The whole team was very kind, warm and professional. Every step of the dental process was clearly explained, which made the experience comfortable and easy to understand.',
    },
    rating: null,
    source: 'google',
  },
  {
    name: 'Carolina Altamirano',
    treatment: { es: 'Muela del juicio', en: 'Wisdom tooth' },
    quote: {
      es: 'Mi experiencia con la extracción fue excelente, la verdad iba muy nerviosa, tenía dolor, de emergencia me ayudaron a sacarla y la verdad que fueron muy profesionales […] fue rápido, en menos de 10 minutos ya estaba sin la muela del juicio. Sí lo recomiendo.',
      en: 'My experience with the extraction was excellent. I was very nervous and in pain, they helped me as an emergency and they were truly very professional […] it was quick, in under 10 minutes my wisdom tooth was out. I do recommend it.',
    },
    rating: null,
    source: 'google',
  },
  {
    name: 'Angel Beltran',
    quote: {
      es: 'Muy profesionales, pacientes mas que nada, y muy buenas personas que ven lo mejor para ti. Gracias a todo el equipo.',
      en: 'Very professional, patient above all, and very good people who look out for what is best for you. Thank you to the whole team.',
    },
    rating: null,
    source: 'google',
  },
]
