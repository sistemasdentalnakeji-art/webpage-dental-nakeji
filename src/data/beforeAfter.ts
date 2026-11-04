import type { Lang, RouteKey } from '@/config/routes'

/**
 * Comparador antes/después (sección "Sobre el tratamiento" de cada servicio). Solo se muestra en los servicios de esta lista.
 * Cada lado es un recorte de una foto: `x`, `y`, `w`, `h` en px de la foto original. Así sirve una foto con el antes y el
 * después juntos (arriba/abajo, como las publicaciones de la clínica) o dos fotos separadas. Antes y después: mismo `w`/`h`.
 * Fotos en public/images/antes-despues/. Salvo Limpieza, todas son casos de Dental Nakeji tomados de su Instagram
 * (@dentalnakeji); el enlace de cada publicación está en el comentario de cada servicio.
 */
export interface BeforeAfterCrop {
  src: string
  /** Tamaño de la foto original. */
  width: number
  height: number
  x: number
  y: number
  w: number
  h: number
}

export interface BeforeAfterPhoto {
  before: BeforeAfterCrop
  after: BeforeAfterCrop
  alt: Record<Lang, string>
}

const DIR = '/images/antes-despues'
const crop = (src: string, width: number, height: number, x: number, y: number, w: number, h: number): BeforeAfterCrop => ({
  src: `${DIR}/${src}`,
  width,
  height,
  x,
  y,
  w,
  h,
})

const patient = (es: string, en: string): Record<Lang, string> => ({
  es: `Paciente de Dental Nakeji: ${es}`,
  en: `Dental Nakeji patient: ${en}`,
})

// All-on-4 y All-on-6 comparten caso: https://www.instagram.com/p/Czw02Kpsazj/
const FULL_ARCH: BeforeAfterPhoto = {
  before: crop('all-on.jpg', 1500, 1500, 200, 330, 1100, 390),
  after: crop('all-on.jpg', 1500, 1500, 200, 835, 1100, 390),
  alt: patient('implantes colocados antes y la arcada completa después', 'implants placed before and a full arch after'),
}

export const BEFORE_AFTER: Partial<Record<RouteKey, BeforeAfterPhoto>> = {
  // Foto que envió la clínica.
  veneers: {
    before: crop('carillas.webp', 1350, 1688, 0, 40, 1350, 700),
    after: crop('carillas.webp', 1350, 1688, 0, 960, 1350, 700),
    alt: patient('sonrisa antes y después de sus carillas', 'smile before and after veneers'),
  },
  // https://www.instagram.com/p/CrOX0CmLOAV/ (la clínica lo publicó como limpieza; se ve el cambio de tono).
  whitening: {
    before: crop('blanqueamiento-antes.jpg', 1440, 1080, 120, 330, 1200, 400),
    after: crop('blanqueamiento-despues.jpg', 1440, 1080, 120, 330, 1200, 400),
    alt: patient('dientes manchados antes y más blancos después', 'stained teeth before and whiter teeth after'),
  },
  // https://www.instagram.com/p/C4TxeiZSv9m/
  orthodontics: {
    before: crop('ortodoncia.jpg', 640, 640, 0, 20, 640, 255),
    after: crop('ortodoncia.jpg', 640, 640, 0, 385, 640, 255),
    alt: patient('con brackets antes y con los dientes alineados después', 'with braces before and aligned teeth after'),
  },
  // https://www.instagram.com/p/CxEnLgXp2li/
  crowns: {
    before: crop('coronas.jpg', 1080, 1080, 0, 78, 1080, 420),
    after: crop('coronas.jpg', 1080, 1080, 0, 580, 1080, 420),
    alt: patient('coronas anteriores antes y coronas de zirconia después', 'old crowns before and zirconia crowns after'),
  },
  // https://www.instagram.com/p/C3bfsweBYVI/
  implants: {
    before: crop('implantes.jpg', 2048, 2048, 520, 380, 1000, 540),
    after: crop('implantes.jpg', 2048, 2048, 530, 1070, 1000, 540),
    alt: patient('sin dientes antes y con implantes después', 'without teeth before and with implants after'),
  },
  // Única foto que no es de la clínica: Wikimedia Commons, Onetimeuseaccount, CC0 (dominio público, sin crédito obligatorio).
  // https://commons.wikimedia.org/wiki/File:Gingivitis-before.JPG · https://commons.wikimedia.org/wiki/File:Gingivitis-after.JPG
  cleaning: {
    before: crop('limpieza-antes.jpg', 1280, 500, 0, 0, 1280, 500),
    after: crop('limpieza-despues.jpg', 1280, 560, 0, 30, 1280, 500),
    alt: {
      es: 'Imagen ilustrativa: encías inflamadas con sarro antes y sanas después de la limpieza',
      en: 'Illustrative image: inflamed gums with tartar before and healthy gums after cleaning',
    },
  },
  'all-on-4': FULL_ARCH,
  'all-on-6': FULL_ARCH,
}

export const BEFORE_AFTER_TEXT: Record<Lang, { before: string; after: string; slider: string }> = {
  es: { before: 'Antes', after: 'Después', slider: 'Desliza para comparar antes y después' },
  en: { before: 'Before', after: 'After', slider: 'Slide to compare before and after' },
}
