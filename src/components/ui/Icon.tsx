// Iconos SVG en línea (sin dependencias). Son decorativos: el texto accesible
// siempre lo aporta el elemento que los contiene.

const PATHS = {
  whatsapp: (
    <>
      <path d="M3.6 20.4l1.3-4.2a8.4 8.4 0 1 1 3.2 3z" />
      <path
        fill="currentColor"
        stroke="none"
        d="M9 8.7c0-.5.4-.9.8-.9h.6c.3 0 .5.2.6.4l.6 1.5c.1.3 0 .6-.2.8l-.5.5c.5 1 1.3 1.8 2.3 2.3l.5-.5c.2-.2.5-.3.8-.2l1.5.6c.3.1.4.4.4.6v.6c0 .5-.4.8-.9.8A6.4 6.4 0 0 1 9 8.7z"
      />
    </>
  ),
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevronLeft: <path d="M14.5 6l-6 6 6 6" />,
  chevronRight: <path d="M9.5 6l6 6-6 6" />,
  star: (
    <path d="M12 3.6l2.5 5.1 5.6.8-4.1 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4.1-3.9 5.6-.8z" />
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
      <path d="M4.5 7.5l7.5 5.5 7.5-5.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  book: (
    <>
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </>
  ),
  phone: (
    <path d="M6.2 3.8h2.6l1.4 3.6-1.8 1.3a10.5 10.5 0 0 0 6.9 6.9l1.3-1.8 3.6 1.4v2.6a1.9 1.9 0 0 1-1.9 1.9A15.9 15.9 0 0 1 4.3 5.7a1.9 1.9 0 0 1 1.9-1.9z" />
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 6.5 2.5 8 2.5 8h-17S6 15.5 6 9z" />
      <path d="M10.2 20.5a2 2 0 0 0 3.6 0" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  tooth: (
    <path d="M7.6 3.6c-2.4 0-4 1.9-4 4.4 0 2 .8 3.4 1.3 5.3.6 2.3.7 7.2 2.7 7.2 1.7 0 1.6-4.7 4.4-4.7s2.7 4.7 4.4 4.7c2 0 2.1-4.9 2.7-7.2.5-1.9 1.3-3.3 1.3-5.3 0-2.5-1.6-4.4-4-4.4-1.8 0-2.7 1-4.4 1s-2.6-1-4.4-1z" />
  ),
  implant: (
    <>
      <path d="M7.2 4.6c0-.9.8-1.6 1.7-1.6h6.2c.9 0 1.7.7 1.7 1.6 0 2.1-1 3.9-2.1 3.9H9.3c-1.1 0-2.1-1.8-2.1-3.9z" />
      <path d="M9.6 8.5h4.8l-.5 9.6L12 21l-1.9-2.9z" />
      <path d="M9.8 11.6h4.4M10 14.4h4M10.2 17.1h3.6" />
    </>
  ),
  // Alineadores: tres dientes dentro de una férula transparente (contorno punteado).
  aligner: (
    <>
      <rect x="1.8" y="3.8" width="20.4" height="16.4" rx="5.5" strokeDasharray="2.2 2.4" />
      <rect x="5" y="7.2" width="3.8" height="9.6" rx="1.9" />
      <rect x="10.1" y="7.2" width="3.8" height="9.6" rx="1.9" />
      <rect x="15.2" y="7.2" width="3.8" height="9.6" rx="1.9" />
    </>
  ),
  // Ortodoncia: tres dientes con brackets y alambre.
  braces: (
    <>
      <rect x="2.5" y="5" width="5.5" height="13" rx="2.3" />
      <rect x="9.25" y="5" width="5.5" height="13" rx="2.3" />
      <rect x="16" y="5" width="5.5" height="13" rx="2.3" />
      <path d="M1.5 11.5h21" />
      <rect x="4" y="10.2" width="2.5" height="2.6" rx=".5" fill="currentColor" />
      <rect x="10.75" y="10.2" width="2.5" height="2.6" rx=".5" fill="currentColor" />
      <rect x="17.5" y="10.2" width="2.5" height="2.6" rx=".5" fill="currentColor" />
    </>
  ),
  // All on 4 / All on 6: puente de dientes fijo sobre 4 o 6 implantes.
  bridge4: (
    <>
      <path d="M2.5 8C6 10.4 18 10.4 21.5 8v5C18 15.4 6 15.4 2.5 13z" />
      <path d="M8.2 9.6v5M12 9.8v5M15.8 9.6v5" strokeWidth={1.2} />
      <path
        fill="currentColor"
        stroke="none"
        d="M4.1 13.9h1.8v4.2L5 19.8l-.9-1.7zM8.8 14.5h1.8v3.6l-.9 1.7-.9-1.7zM13.4 14.5h1.8v3.6l-.9 1.7-.9-1.7zM18.1 13.9h1.8v4.2l-.9 1.7-.9-1.7z"
      />
    </>
  ),
  bridge6: (
    <>
      <path d="M2.5 8C6 10.4 18 10.4 21.5 8v5C18 15.4 6 15.4 2.5 13z" />
      <path d="M8.2 9.6v5M12 9.8v5M15.8 9.6v5" strokeWidth={1.2} />
      <path
        fill="currentColor"
        stroke="none"
        d="M3.6 13.8h1.8v4.3L4.5 19.8l-.9-1.7zM6.6 14.4h1.8v3.7l-.9 1.7-.9-1.7zM9.6 14.8h1.8v3.3l-.9 1.7-.9-1.7zM12.6 14.8h1.8v3.3l-.9 1.7-.9-1.7zM15.6 14.4h1.8v3.7l-.9 1.7-.9-1.7zM18.6 13.8h1.8v4.3l-.9 1.7-.9-1.7z"
      />
    </>
  ),
  sparkle: (
    <>
      <path d="M11 3.5l1.7 4.9 4.8 1.7-4.8 1.7L11 16.7l-1.7-4.9-4.8-1.7 4.8-1.7z" />
      <path d="M18 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.4-7.5 9.5-4.3-1.1-7.5-4.9-7.5-9.5V6z" />
      <path d="M8.8 12l2.2 2.2 4.2-4.4" />
    </>
  ),
  building: (
    <path d="M4.5 20.5V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15.5M14.5 9h4a1 1 0 0 1 1 1v10.5M3 20.5h18M8 8h3M8 12h3M8 16h3" />
  ),
  crown: (
    <>
      <path d="M5 18.5L3.5 9.5 8 13l4-7 4 7 4.5-3.5L19 18.5z" />
      <path d="M6 21.5h12" />
    </>
  ),
  // Laboratorio dental: matraz para preparación y mezcla de materiales.
  flask: (
    <>
      <path d="M9 3h6M10 3v5l-5 8.8A2.8 2.8 0 0 0 7.4 21h9.2a2.8 2.8 0 0 0 2.4-4.2L14 8V3" />
      <path d="M7.2 15h9.6M9.3 11.8h5.4" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.2 13.6c1 1.8 2.3 2.6 3.8 2.6s2.8-.8 3.8-2.6M9 9.6v.6M15 9.6v.6" />
    </>
  ),
  pause: <path d="M8.5 6v12M15.5 6v12" />,
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  // Persona (Odontopediatría en el catálogo, campo "Nombre" del formulario).
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20.5c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
    </>
  ),
  // Misión: diana con flecha.
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 12l7-7M16 5h3v3" />
    </>
  ),
  // Visión: ojo.
  eye: (
    <>
      <path d="M2.8 12c2.2-4 5.3-6 9.2-6s7 2 9.2 6c-2.2 4-5.3 6-9.2 6s-7-2-9.2-6z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  // Tecnología: microchip.
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </>
  ),
  // Especialistas: dos personas.
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.4-3 2.6-4.8 5.5-4.8s5.1 1.8 5.5 4.8" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M16.5 14.4c2.3-.1 4 1.3 4.5 3.8" />
    </>
  ),
  // Endodoncia: molar con una lima entrando por el conducto (mango, tope y punta).
  endo: (
    <>
      <path
        transform="translate(1 3.2) scale(.85)"
        d="M7.6 3.6c-2.4 0-4 1.9-4 4.4 0 2 .8 3.4 1.3 5.3.6 2.3.7 7.2 2.7 7.2 1.7 0 1.6-4.7 4.4-4.7s2.7 4.7 4.4 4.7c2 0 2.1-4.9 2.7-7.2.5-1.9 1.3-3.3 1.3-5.3 0-2.5-1.6-4.4-4-4.4-1.8 0-2.7 1-4.4 1s-2.6-1-4.4-1z"
      />
      <path d="M15.9 4.6L10.8 15.6" strokeWidth={1.3} />
      <path d="M17.7 1.5l-1.5 2.7" strokeWidth={2.8} />
      <path d="M13 7.3l2.9 1.3" strokeWidth={1.3} />
    </>
  ),
  // Dentaduras: dentadura postiza (encía y cuatro dientes) dentro de un vaso con agua.
  denture: (
    <>
      <path d="M3.2 4.5h17.6l-1.9 14.7a2 2 0 0 1-2 1.8H7.1a2 2 0 0 1-2-1.8z" />
      <rect x="6.5" y="7.6" width="11" height="2.8" rx="1.4" />
      <path
        d="M6.7 10.4v2.1a1.2 1.2 0 0 0 2.4 0v-2.1M9.5 10.4v2.1a1.2 1.2 0 0 0 2.4 0v-2.1M12.3 10.4v2.1a1.2 1.2 0 0 0 2.4 0v-2.1M15.1 10.4v2.1a1.2 1.2 0 0 0 2.4 0v-2.1"
        strokeWidth={1.2}
      />
      <path d="M4.4 15.6c1.9-1.1 3.8-1.1 5.7 0s3.8 1.1 5.7 0 2.8-.9 3.9-.3" strokeWidth={1.3} />
    </>
  ),
  drop: <path d="M12 3.5c3.2 3.9 5.5 6.8 5.5 9.6a5.5 5.5 0 0 1-11 0c0-2.8 2.3-5.7 5.5-9.6z" />,
  // Páginas legales (una por sección): mensaje, ayuda, candado, documento, compartir, balanza y actualizar.
  message: (
    <>
      <path d="M4.5 5h15a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H11L6.5 20v-3.5h-2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.6a2.5 2.5 0 1 1 3.6 2.2c-.8.5-1.2 1-1.2 1.9M12 16.6v.1" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2.5" />
    </>
  ),
  document: (
    <>
      <path d="M7 3.5h7l4.5 4.5v11a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" />
      <path d="M14 3.5V8h4.5M8.5 12.5h7M8.5 16h5" />
    </>
  ),
  share: (
    <>
      <circle cx="6.5" cy="12" r="2.3" />
      <circle cx="17.5" cy="6.5" r="2.3" />
      <circle cx="17.5" cy="17.5" r="2.3" />
      <path d="M8.5 10.9l7-3.3M8.5 13.1l7 3.3" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16M7 20h10M5 7.5h14" />
      <path d="M5 7.5L2.8 13a3 3 0 0 0 4.4 0zM19 7.5L16.8 13a3 3 0 0 0 4.4 0z" />
    </>
  ),
  refresh: (
    <>
      <path d="M19.5 12a7.5 7.5 0 0 1-13 5.1M4.5 12a7.5 7.5 0 0 1 13-5.1" />
      <path d="M18.5 3.5v4h-4M5.5 20.5v-4h4" />
    </>
  ),
} as const

export type IconName = keyof typeof PATHS

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
