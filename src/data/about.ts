// ─────────────────────────────────────────────────────────────────────────────
// TEXTOS DE LA PÁGINA /nosotros/ (pages/about/AboutPage.tsx), en inglés (en) y español (es).
//
// La historia usa el texto aprobado para la página. La misión, la visión y los integrantes pendientes siguen provisionales.
// Los hitos no llevan fecha y los lugares sin persona son marcadores ("Integrante N" / "Team member N").
// Para poner una persona real: person(...) con la foto en public/images/equipo/archivo.webp (en las dos versiones).
// En inglés, "Dra."/"Dr." pasan a "Dr."; el resto de títulos abreviados (Lic., Asist., TDP, Ing.) se omiten y el cargo queda en la ficha.
// Equivalencias del inglés: gan-harness/glosario-en.md.
// ─────────────────────────────────────────────────────────────────────────────

import type { IconName } from '@/components/ui/Icon'
import type { Lang } from '@/config/routes'

export const ABOUT_INTRO: Record<Lang, { eyebrow: string; title: string; lead: string }> = {
  en: {
    eyebrow: 'About us',
    title: 'The people behind your smile',
    lead: 'Learn how Dental Nakeji began, what drives us every day, and meet the team that welcomes you in Zona Río, Tijuana.',
  },
  es: {
    eyebrow: 'Nosotros',
    title: 'Las personas detrás de tu sonrisa',
    lead: 'Conoce cómo empezó Dental Nakeji, qué nos mueve cada día y al equipo que te recibe en la Zona Río de Tijuana.',
  },
}

export interface HistoryPhoto {
  src: string
  alt: string
}

interface HistoryMilestone {
  label: string
  text: string
  photo?: HistoryPhoto
  topPhoto?: HistoryPhoto
  gallery?: HistoryPhoto[]
}

const photo = (file: string, alt: string): HistoryPhoto => ({ src: `/images/nosotros/${file}`, alt })

export const HISTORY: Record<Lang, { title: string; milestones: HistoryMilestone[] }> = {
  en: {
    title: 'Our story',
    milestones: [
      {
        label: 'Beginnings',
        text: 'It all began with the wish to help people smile with confidence and peace of mind by caring for their oral health. That dream still guides our commitment to professional, compassionate, high-quality care.',
      },
      {
        label: 'Growth',
        text: 'Over the years we have brought together highly trained professionals in different dental specialties. Our doctors contribute their experience and knowledge to offer a wide variety of quality treatments, suited to each patient’s needs.',
        gallery: [
          photo('crecimiento-atencion-dental-1.jpg', 'Dental Nakeji professional caring for a patient in the office'),
          photo('crecimiento-atencion-dental-2.jpg', 'Dental Nakeji professional during a patient’s care'),
          photo('crecimiento-atencion-dental-3.jpg', 'Dental Nakeji doctor performing a dental treatment'),
        ],
      },
      {
        label: 'Technology',
        text: 'This team of specialists is joined by a dental laboratory equipped with state-of-the-art technology that supports their work and the quality of our clinic. They combine these tools with their experience to look after every detail and offer quality care.',
        topPhoto: photo('clinica-hoy-consultorio.jpg', 'Dental Nakeji office with dental equipment and a view of Tijuana'),
        photo: photo('clinica-hoy-vista-general.jpg', 'Dental Nakeji clinical area with a panoramic view of Tijuana'),
      },
      {
        label: 'Today',
        text: 'Today, that whole journey is reflected in a dental clinic in Tijuana that brings together experience, specialists and technology to care for patients from Mexico and the United States. From preventive care to specialized treatments, we want every person to receive quality care and feel heard and at ease.',
        photo: photo('clinica-hoy-recepcion.jpg', 'Dental Nakeji reception with its blue desk, waiting area and gold details'),
      },
    ],
  },
  es: {
    title: 'Nuestra historia',
    milestones: [
      {
        label: 'Inicios',
        text: 'Todo empezó con el deseo de ayudar a las personas a sonreír con confianza, seguridad y tranquilidad a través del cuidado de su salud bucal. Ese sueño sigue guiando nuestro compromiso con una atención profesional, humana y de calidad.',
      },
      {
        label: 'Crecimiento',
        text: 'Con el paso de los años hemos reunido a profesionales altamente capacitados en distintas especialidades dentales. Nuestros doctores aportan su experiencia y conocimiento para ofrecer una amplia variedad de tratamientos de calidad, acordes con las necesidades de cada paciente.',
        gallery: [
          photo('crecimiento-atencion-dental-1.jpg', 'Profesional de Dental Nakeji atendiendo a una paciente en el consultorio'),
          photo('crecimiento-atencion-dental-2.jpg', 'Profesional de Dental Nakeji durante la atención de una paciente'),
          photo('crecimiento-atencion-dental-3.jpg', 'Doctor de Dental Nakeji realizando un tratamiento dental'),
        ],
      },
      {
        label: 'Tecnología',
        text: 'A este equipo de especialistas se le suma un laboratorio dental equipado con tecnología de vanguardia que respalda su trabajo y la calidad de nuestra clínica. Ellos combinan estas herramientas con su experiencia para cuidar cada detalle y ofrecer una atención de calidad.',
        topPhoto: photo('clinica-hoy-consultorio.jpg', 'Consultorio de Dental Nakeji con equipo dental y vista de Tijuana'),
        photo: photo('clinica-hoy-vista-general.jpg', 'Área clínica de Dental Nakeji con vista panorámica de Tijuana'),
      },
      {
        label: 'Hoy',
        text: 'Hoy, todo ese camino se refleja en una clínica dental en Tijuana que reúne experiencia, especialistas y tecnología para atender a pacientes de México y Estados Unidos. Desde el cuidado preventivo hasta los tratamientos especializados, buscamos que cada persona reciba atención de calidad y se sienta escuchada y en confianza.',
        photo: photo('clinica-hoy-recepcion.jpg', 'Recepción de Dental Nakeji con su mostrador azul, sala de espera y detalles dorados'),
      },
    ],
  },
}

// Valores principales, ordenados de mayor importancia a menor.
const VALUE_ICONS = [
  ['excelencia', 'star'],
  ['profesionalidad', 'users'],
  ['responsabilidad', 'shield'],
  ['innovacion', 'sparkle'],
  ['confianza', 'smile'],
] as const satisfies readonly (readonly [string, IconName])[]

const VALUE_TITLES: Record<Lang, string[]> = {
  en: ['Excellence', 'Professionalism', 'Responsibility', 'Innovation', 'Trust'],
  es: ['Excelencia', 'Profesionalidad', 'Responsabilidad', 'Innovación', 'Confianza'],
}

export const VALUES: Record<Lang, { title: string; items: { id: string; icon: IconName; title: string }[] }> = {
  en: {
    title: 'Our values',
    items: VALUE_ICONS.map(([id, icon], i) => ({ id, icon, title: VALUE_TITLES.en[i] })),
  },
  es: {
    title: 'Nuestros valores',
    items: VALUE_ICONS.map(([id, icon], i) => ({ id, icon, title: VALUE_TITLES.es[i] })),
  },
}

export const PURPOSE: Record<Lang, { id: string; icon: IconName; title: string; text: string }[]> = {
  en: [
    {
      id: 'mision',
      icon: 'target',
      title: 'Mission',
      text: 'To provide the highest-quality dental care so that every patient leaves with a healthy, beautiful, confident smile, backed by a team of highly trained professionals committed to their well-being.',
    },
    {
      id: 'vision',
      icon: 'eye',
      title: 'Vision',
      text: 'To be a leading dental clinic in Tijuana with international reach, recognized for the trust of its patients, the quality of its treatments and the constant growth of its team and technology.',
    },
  ],
  es: [
    {
      id: 'mision',
      icon: 'target',
      title: 'Misión',
      text: 'Brindar atención dental de la más alta calidad para que cada paciente se lleve una sonrisa sana, bella y llena de confianza, con el respaldo de un equipo de profesionales altamente capacitados y comprometidos con su bienestar.',
    },
    {
      id: 'vision',
      icon: 'eye',
      title: 'Visión',
      text: 'Ser una clínica dental referente en Tijuana con proyección internacional, reconocida por la confianza de sus pacientes, la calidad de sus tratamientos y la evolución constante de su equipo y tecnología.',
    },
  ],
}

export interface Member {
  name: string
  /** Título abreviado (Dra., Dr., Lic., Asist., Ing., TDP): va en la misma línea, antes del nombre. */
  title?: string
  /** Cargo o especialidad que se muestra en la ficha del retrato. */
  specialty?: string
  /** Foto en public/images/equipo/ (retrato con fondo blanco). Sin ella, la tarjeta lleva un icono. */
  photo?: string
}

const person = (title: string | undefined, name: string, specialty: string | undefined, photo: string): Member => ({
  title,
  name,
  specialty,
  photo: `/images/equipo/${photo}.webp`,
})

interface TeamArea {
  id: string
  icon: IconName
  title: string
  members: Member[]
}

export const TEAM: Record<Lang, { title: string; lead: string; areas: TeamArea[] }> = {
  en: {
    title: 'Our team',
    lead: 'Five areas working together to make your visit simple, from the first call to the last adjustment.',
    areas: [
      {
        id: 'gerencia',
        icon: 'building',
        title: 'Management',
        members: [person(undefined, 'Abril Ramírez', 'General manager of the clinic', 'abril-ramirez')],
      },
      {
        id: 'doctores',
        icon: 'tooth',
        title: 'Doctors',
        members: [
          person('Dr.', 'Laura Tamez', 'Dental surgeon, coordinator and manager', 'laura-tamez'),
          person('Dr.', 'Sergio Palacio', 'Dental surgeon and the clinic’s health officer', 'sergio-palacio'),
          person('Dr.', 'Gustavo Garduño', 'Dental surgeon and implantologist', 'gustavo-garduno'),
          person('Dr.', 'Leslie Brizuela', 'Dental surgeon and orthodontist', 'leslie-brizuela'),
          person('Dr.', 'Alejandra Blanco', 'General dental surgeon', 'alejandra-blanco'),
          person('Asst.', 'Fernanda López', 'Dental assistant', 'fernanda-lopez'),
        ],
      },
      {
        id: 'administracion',
        icon: 'calendar',
        title: 'Administration',
        members: [
          person('Lic.', 'Damaris Llamas', 'Laboratory administrator', 'damaris-llamas'),
          person('Lic.', 'Michelle Stevens', 'Patient coordinator', 'michelle-lopez'),
        ],
      },
      {
        id: 'laboratorio',
        icon: 'flask',
        title: 'Dental lab',
        members: [person('TDP', 'Isaac Ramírez', 'Dental lab manager and dental technician', 'isaac-ramirez')],
      },
      // Sin foto: se muestra el icono de persona hasta que haya una.
      {
        id: 'tecnico',
        icon: 'chip',
        title: 'Technology infrastructure',
        members: [{ title: 'Ing./Mtro.', name: 'Jadro Montes', specialty: 'Head of technology' }],
      },
    ],
  },
  es: {
    title: 'Nuestro equipo',
    lead: 'Cinco áreas trabajando juntas para que tu visita sea sencilla, de la primera llamada al último ajuste.',
    areas: [
      {
        id: 'gerencia',
        icon: 'building',
        title: 'Gerencia',
        members: [
          person(undefined, 'Abril Ramírez', 'Gerente general de la clínica', 'abril-ramirez'),
        ],
      },
      {
        id: 'doctores',
        icon: 'tooth',
        title: 'Doctores',
        members: [
          person('Dra.', 'Laura Tamez', 'Cirujano dentista, coordinadora y manager', 'laura-tamez'),
          person('Dr.', 'Sergio Palacio', 'Cirujano dentista clínico y responsable sanitario', 'sergio-palacio'),
          person('Dr.', 'Gustavo Garduño', 'Cirujano dentista e implantólogo', 'gustavo-garduno'),
          person('Dra.', 'Leslie Brizuela', 'Cirujano dentista ortodoncista', 'leslie-brizuela'),
          person('Dra.', 'Alejandra Blanco', 'Cirujana dentista general', 'alejandra-blanco'),
          person('Asist.', 'Fernanda López', 'Asistente dental', 'fernanda-lopez'),
        ],
      },
      {
        id: 'administracion',
        icon: 'calendar',
        title: 'Administración',
        members: [
          person('Lic.', 'Damaris Llamas', 'Administradora de laboratorio', 'damaris-llamas'),
          person('Lic.', 'Michelle Stevens', 'Coordinadora de pacientes', 'michelle-lopez'),
        ],
      },
      // TDP: así lo dio la clínica (técnico del laboratorio dental, no de sistemas).
      {
        id: 'laboratorio',
        icon: 'flask',
        title: 'Laboratorio dental',
        members: [person('TDP', 'Isaac Ramírez', 'Gerente de laboratorio y técnico dental', 'isaac-ramirez')],
      },
      // Sin foto: se muestra el icono de persona hasta que haya una.
      {
        id: 'tecnico',
        icon: 'chip',
        title: 'Infraestructura tecnológica',
        members: [{ title: 'Ing./Mtro.', name: 'Jadro Montes', specialty: 'Responsable del área tecnológica de la empresa' }],
      },
    ],
  },
}

/** Etiquetas de accesibilidad de la página. */
export const ABOUT_A11Y: Record<
  Lang,
  { carousel: string; prev: string; next: string; purpose: string; flip: (name: string, specialty?: string) => string }
> = {
  en: {
    carousel: 'Growth of our team',
    prev: 'Previous photo',
    next: 'Next photo',
    purpose: 'Mission and vision',
    flip: (name, specialty) => `${name}${specialty ? `, ${specialty}` : ''}: flip card`,
  },
  es: {
    carousel: 'Crecimiento de nuestro equipo',
    prev: 'Fotografía anterior',
    next: 'Fotografía siguiente',
    purpose: 'Misión y visión',
    flip: (name, specialty) => `${name}${specialty ? `, ${specialty}` : ''}: voltear tarjeta`,
  },
}
