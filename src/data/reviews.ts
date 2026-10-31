// Reseñas de Google. Mientras no haya conexión, el sitio no muestra tarjetas (nunca reseñas de ejemplo).
// Las reales llegan de api/reviews.ts (Google Places API) y las pide src/lib/useGoogleReviews.ts; los campos son los
// que entrega Google: autor, calificación, texto y fecha relativa. Se conserva la atribución que exige Google
// (nombre/enlace del autor y logo de Google).

import { SITE } from '@/config/site'

export interface Review {
  author: string
  /** 1 a 5. `null` mientras sea un marcador. */
  rating: number | null
  text: string
  relativeTime: string
  authorUrl?: string
  photoUrl?: string
  /** La reseña en Google Maps. */
  googleUrl?: string
}

/** Respuesta de api/reviews.ts. */
export interface GoogleReviews {
  rating: number | null
  total: number | null
  reviews: Review[]
}

export const REVIEWS_SUMMARY = {
  /** Calificación promedio y total de reseñas en Google. `null` mientras no haya conexión. */
  rating: null as number | null,
  total: null as number | null,
  profileUrl: SITE.address.mapsUrl,
}
