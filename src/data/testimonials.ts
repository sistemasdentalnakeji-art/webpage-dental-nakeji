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
    text: 'Historias reales de pacientes que le confiaron su sonrisa a Dental Nakeji.',
    list: 'Testimonios de pacientes',
    video: 'Testimonios en video de Dental Nakeji',
  },
  en: {
    title: 'Testimonials',
    text: 'Real stories from patients who trusted Dental Nakeji with their smile.',
    list: 'Patient testimonials',
    video: 'Dental Nakeji video testimonial',
  },
}

/**
 * Videos verticales (9:16) del panel izquierdo (acordeón de videos). `name` es lo que se lee en la tira cerrada.
 * Reels de @dentalnakeji (Instagram): DdxDNxfSXhu (Aron), DdZy3A0Shzm (Casey), DdUs65KSiPe (Precisión), DdsI7U7oosh (Equipo).
 */
export const TESTIMONIAL_VIDEOS: { src: string; name: string; label: Record<Lang, string> }[] = [
  {
    src: '/videos/testimonios/paciente-san-diego.mp4',
    name: 'Aron',
    label: { es: 'Video: Aron, paciente de San Diego, con implantes', en: 'Video: Aron, a San Diego patient with implants' },
  },
  {
    src: '/videos/testimonios/casey-missouri.mp4',
    name: 'Casey',
    label: { es: 'Video: Casey, paciente de Missouri', en: 'Video: Casey, a patient from Missouri' },
  },
  {
    src: '/videos/testimonio-dental-nakeji.mp4',
    name: 'Natalie',
    label: { es: 'Video: Natalie, paciente de Dental Nakeji', en: 'Video: Natalie, a Dental Nakeji patient' },
  },
  {
    src: '/videos/testimonios/precision.mp4',
    name: 'Equipo',
    label: { es: 'Video: nuestro equipo en consulta', en: 'Video: our team at work' },
  },
  {
    src: '/videos/testimonios/equipo.mp4',
    name: 'Equipo',
    label: { es: 'Video: nuestro equipo en consulta', en: 'Video: our team at work' },
  },
]

// Tres reseñas reales de Google (perfil Dental Nakeji, 3 nov 2026), copiadas tal cual; en inglés, traducción.
// Máximo 4 (se muestran las 4 primeras). Para cambiarlas, edita esta lista.
// Estrellas: las tres muestran 5 (decisión del sitio); si una reseña tiene otra calificación en Google, cámbiala aquí.
//
// Fotos de archivo (public/images/testimonios): no son de quienes escribieron las reseñas. Para usar la foto de un
// paciente real, cambia el archivo de `photo.src` (con su permiso por escrito).
//   Greg      → Unsplash, Nathan Dumlao (@nate_dumlao)  https://unsplash.com/photos/26rK1-bH9Ls  (licencia Unsplash)
//   Jesús     → Unsplash, Elizeu Dias (@elishavision)   https://unsplash.com/photos/2EGNqazbAMk  (licencia Unsplash)
//   Dulce     → Pexels, foto 39300218                   https://www.pexels.com/photo/39300218/  (licencia Pexels)
//   Carolina  → foto que envió el dueño del sitio (sonrisa-carolina-sueter.webp): origen y licencia por confirmar.
export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Greg Person',
    photo: {
      src: '/images/testimonios/sonrisa-greg.webp',
      alt: { es: 'Foto ilustrativa de un hombre sonriendo', en: 'Illustrative photo of a smiling man' },
    },
    quote: {
      es: 'Mi experiencia en Nakeji Dental fue excelente de principio a fin. Todo el equipo fue muy amable, cálido y profesional. Me explicaron con claridad cada paso del tratamiento, así que todo resultó cómodo y fácil de entender.',
      en: 'Nakeji Dental was an excellent experience from start to finish. The whole team was very kind, warm and professional. Every step of the dental process was clearly explained, which made the experience comfortable and easy to understand.',
    },
    rating: 5,
  },
  {
    name: 'Carolina Altamirano',
    treatment: { es: 'Extracción de muela del juicio', en: 'Wisdom tooth extraction' },
    photo: {
      src: '/images/testimonios/sonrisa-carolina-sueter.webp',
      alt: {
        es: 'Foto ilustrativa de una joven sonriendo con brackets',
        en: 'Illustrative photo of a young woman smiling with braces',
      },
    },
    quote: {
      es: 'Mi experiencia con la extracción fue excelente. La verdad, iba muy nerviosa y tenía dolor; de emergencia me ayudaron a sacarla y la verdad que fueron muy profesionales. Fue rápido: en menos de 10 minutos ya estaba sin la muela del juicio. Sí lo recomiendo.',
      en: 'My experience with the extraction was excellent. I was very nervous and in pain, and they took me in as an emergency and were truly professional. It was quick: in under 10 minutes my wisdom tooth was out. I do recommend it.',
    },
    rating: 5,
  },
  {
    name: 'Jesús Villa',
    photo: {
      src: '/images/testimonios/sonrisa-angel.webp',
      alt: { es: 'Foto ilustrativa de un hombre sonriendo', en: 'Illustrative photo of a smiling man' },
    },
    quote: {
      es: 'Recomendado ampliamente. Excelente servicio del personal. Las instalaciones están muy limpias y en buen estado. Sin duda, seguiré mi tratamiento y revisiones de rutina con ellos.',
      en: 'Highly recommended. Excellent service from the staff. The facilities are very clean and well kept. I will definitely continue my treatment and routine check-ups with them.',
    },
    rating: 5,
  },
  {
    name: 'Dulce Pedraza',
    photo: {
      src: '/images/testimonios/sonrisa-senora.jpg',
      alt: { es: 'Foto ilustrativa de una mujer mayor sonriendo', en: 'Illustrative photo of an older woman smiling' },
    },
    quote: {
      es: 'Excelente atención por parte del Dr. Sergio, es muy cuidadoso, paciente y te explica los pasos del procedimiento que te va realizando. Quedé muy satisfecha con su trabajo.',
      en: 'Excellent care from Dr. Sergio. He is very careful and patient, and he explains each step of the procedure as he goes. I was very happy with his work.',
    },
    rating: 5,
  },
]
