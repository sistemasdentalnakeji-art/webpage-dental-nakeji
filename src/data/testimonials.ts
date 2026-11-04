import type { Lang } from '@/config/routes'

export interface Testimonial {
  name: string
  /** Tratamiento que recibió, por idioma (opcional). */
  treatment?: Record<Lang, string>
  /** La cita del paciente: `es` es el texto original; `en` es una traducción. */
  quote: Record<Lang, string>
  /** 1 a 5; sin valor (null) no se dibujan estrellas. Se muestran bajo el nombre. */
  rating: number | null
  /** Foto de archivo (public/images/testimonios). NO es del autor de la reseña. */
  photo?: { src: string; alt: Record<Lang, string> }
}

export const TESTIMONIALS_SECTION: Record<
  Lang,
  { title: string; text: string; list: string; video: string }
> = {
  es: {
    title: 'Testimoniales',
    text: 'Historias reales de personas que confiaron su sonrisa a Dental Nakeji.',
    list: 'Testimonios de pacientes',
    video: 'Video testimonio de Dental Nakeji',
  },
  en: {
    title: 'Testimonials',
    text: 'Real stories from people who trusted Dental Nakeji with their smile.',
    list: 'Patient testimonials',
    video: 'Dental Nakeji video testimonial',
  },
}

/**
 * Videos verticales (9:16) del carrusel de la columna izquierda, en este orden. Lista vacía: solo se muestran las tarjetas.
 * Los de public/videos/testimonios/ son reels de @dentalnakeji (Instagram): DdxDNxfSXhu, DdUs65KSiPe, DdZy3A0Shzm, DdsI7U7oosh.
 */
export const TESTIMONIAL_VIDEOS: { src: string; label: Record<Lang, string> }[] = [
  {
    src: '/videos/testimonios/paciente-san-diego.mp4',
    label: { es: 'Paciente de San Diego con implantes dentales', en: 'San Diego patient with dental implants' },
  },
  { src: '/videos/testimonios/casey-missouri.mp4', label: { es: 'Casey, paciente de Missouri', en: 'Casey, a patient from Missouri' } },
  { src: '/videos/testimonio-dental-nakeji.mp4', label: { es: 'Testimonio de un paciente', en: 'Patient testimonial' } },
  { src: '/videos/testimonios/precision.mp4', label: { es: 'Precisión en cada tratamiento', en: 'Precision in every treatment' } },
  { src: '/videos/testimonios/equipo.mp4', label: { es: 'Nuestro equipo en consulta', en: 'Our team at work' } },
]

// Tres reseñas reales de Google (perfil Dental Nakeji, 3 nov 2026), copiadas tal cual; en inglés, traducción.
// Máximo 3 (se muestran las 3 primeras). Para cambiarlas, edita esta lista.
// Estrellas: las tres muestran 5 (decisión del sitio); si una reseña tiene otra calificación en Google, cámbiala aquí.
//
// Fotos de archivo (public/images/testimonios): no son de quienes escribieron las reseñas. Para usar la foto de un
// paciente real, cambia el archivo de `photo.src` (con su permiso por escrito).
//   Greg      → Unsplash, Nathan Dumlao (@nate_dumlao)  https://unsplash.com/photos/26rK1-bH9Ls  (licencia Unsplash)
//   Jesús     → Unsplash, Elizeu Dias (@elishavision)   https://unsplash.com/photos/2EGNqazbAMk  (licencia Unsplash)
//   Carolina  → foto que envió el dueño del sitio (sonrisa-carolina-sueter.webp): origen y licencia por confirmar.
export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Greg Person',
    photo: {
      src: '/images/testimonios/sonrisa-greg.webp',
      alt: { es: 'Imagen ilustrativa: hombre sonriendo', en: 'Illustrative image: man smiling' },
    },
    quote: {
      es: 'Nakeji Dental fue una excelente experiencia de principio a fin. Todo el equipo fue muy amable, cálido y profesional. Cada paso del proceso dental fue explicado claramente, lo que hizo que la experiencia fuera cómoda y fácil de entender.',
      en: 'Nakeji Dental was an excellent experience from start to finish. The whole team was very kind, warm and professional. Every step of the dental process was clearly explained, which made the experience comfortable and easy to understand.',
    },
    rating: 5,
  },
  {
    name: 'Carolina Altamirano',
    treatment: { es: 'Muela del juicio', en: 'Wisdom tooth' },
    photo: {
      src: '/images/testimonios/sonrisa-carolina-sueter.webp',
      alt: {
        es: 'Imagen ilustrativa: mujer joven sonriendo con frenos',
        en: 'Illustrative image: young woman smiling with braces',
      },
    },
    quote: {
      es: 'Mi experiencia con la extracción fue excelente, la verdad iba muy nerviosa, tenía dolor, de emergencia me ayudaron a sacarla y la verdad que fueron muy profesionales. Fue rápido, en menos de 10 minutos ya estaba sin la muela del juicio. Sí lo recomiendo.',
      en: 'My experience with the extraction was excellent. I was very nervous and in pain, they helped me as an emergency and they were truly very professional. It was quick, in under 10 minutes my wisdom tooth was out. I do recommend it.',
    },
    rating: 5,
  },
  {
    name: 'Jesús Villa',
    photo: {
      src: '/images/testimonios/sonrisa-angel.webp',
      alt: { es: 'Imagen ilustrativa: hombre sonriendo', en: 'Illustrative image: man smiling' },
    },
    quote: {
      es: 'Recomendado ampliamente. Excelente servicio del personal. Las instalaciones están muy limpias y en buen estado. Sin duda, seguiré mi tratamiento y revisiones de rutina con ellos.',
      en: 'Highly recommended. Excellent service from the staff. The facilities are very clean and well kept. I will definitely continue my treatment and routine check-ups with them.',
    },
    rating: 5,
  },
]
