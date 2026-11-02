// ─────────────────────────────────────────────────────────────────────────────
// TARJETA DE UBICACIÓN EXPANDIBLE (inspirada en "Location Map" de 21st.dev; código propio, sin dependencias)
//
// • Reemplaza al mapa de Google. En reposo es una tarjeta azul oscuro centrada en su recuadro (icono, etiqueta, nombre)
//   que se mece de lado a lado (~2 s). SE ABRE SOLA: al llegar a la sección (≥ 35 % visible) espera
//   2 s y se abre; al salir de la zona (< 35 %) se cierra, y se repite al volver. También con clic o Enter/Espacio
//   (Escape o un nuevo clic la contraen); si la persona la usa a mano, no se automatiza hasta que salga de la zona.
// • Al expandirse llena todo el recuadro y se dibuja el plano de las calles de alrededor, con el pin de la clínica como
//   protagonista (rojo, con su nombre; ilustración propia en src/data/locationMap.ts, no es un mapa real). Sin texto encima:
//   la dirección y el botón "Cómo llegar" viven en el panel de contacto de la izquierda.
// • Un solo <button> cubre la tarjeta y la alterna (aria-expanded).
// • Sin window/document en el render (el prerender corre en Node): el observador solo se usan en eventos y efectos.
// • Estilos → src/styles/components/location-map.css. Uso: sections/ContactLocation.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { BLOCKS, LABELS, MAP_VIEW, PARK, PIN, RIVER, ROADS, TERRAIN } from '@/data/locationMap'
import { useLang } from '@/app/lang'
import { UI } from '@/data/ui'
import { Icon } from '@/components/ui/Icon'

/** Espera (ms) desde que la sección es visible hasta que la tarjeta se abre sola. */
const OPEN_DELAY = 2000

interface LocationMapProps {
  name: string
  /** Etiqueta junto al punto pulsante (p. ej. la colonia). */
  tag: string
}

/** Índice del elemento: lo usa el CSS para escalonar la aparición. */
const step = (index: number) => ({ '--i': index }) as CSSProperties

export function LocationMap({ name, tag }: LocationMapProps) {
  const ui = UI[useLang()].map
  const [expanded, setExpanded] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<number | undefined>(undefined)
  const manualRef = useRef(false) // la persona la abrió o cerró a mano: no se automatiza hasta que salga de la zona

  // Automática: al llegar a la sección (≥ 35 % visible) espera OPEN_DELAY y se abre; al salir de la zona (< 35 %) se cierra.
  // Se repite cada vez que se vuelve a entrar, salvo que la persona la haya usado a mano mientras estaba en la zona.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timerRef.current)
        if (entry.intersectionRatio >= 0.35) {
          if (manualRef.current) return
          timerRef.current = window.setTimeout(() => {
            // Si la persona ya está con el foco dentro, no se le mueve nada.
            // Solo el foco de teclado lo frena: tras un clic con el mouse el botón queda enfocado y nunca volvería a abrirse solo.
            if (stage.querySelector(':focus-visible')) return
            setExpanded(true)
          }, OPEN_DELAY)
        } else {
          manualRef.current = false
          setExpanded(false)
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(stage)
    return () => {
      observer.disconnect()
      window.clearTimeout(timerRef.current)
    }
  }, [])

  const toggle = () => {
    manualRef.current = true
    window.clearTimeout(timerRef.current)
    setExpanded((value) => !value)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || !expanded) return
    manualRef.current = true
    setExpanded(false)
    toggleRef.current?.focus() // el foco no se pierde: la capa de información queda inerte
  }

  return (
    <div
      ref={stageRef}
      className="loc"
      data-expanded={expanded || undefined}
      onKeyDown={onKeyDown}
    >
      <div className="loc__card">
        {/* Cuadrícula tenue (solo contraída). */}
        <span className="loc__grid" aria-hidden="true" />

        {/* Plano (decorativo): terreno, bloques, calles que se trazan, nombres y el pin de la clínica. */}
        <div className="loc__map" aria-hidden="true">
          <svg className="loc__svg" viewBox={MAP_VIEW} preserveAspectRatio="xMaxYMin slice">
            <polygon className="loc__terrain" points={TERRAIN} />
            <polygon className="loc__park" points={PARK} />
            <path className="loc__river" d={RIVER} />
            {BLOCKS.map((block, index) => (
              <polygon
                key={block.points}
                className={`loc__block loc__block--${block.tone}`}
                points={block.points}
                style={step(index)}
              />
            ))}
            {ROADS.map((road, index) => (
              <path
                key={road.d}
                className={`loc__road loc__road--${road.kind}`}
                d={road.d}
                strokeWidth={road.width}
                pathLength={1}
                style={step(index)}
              />
            ))}
            {LABELS.map((label) => (
              <text
                key={`${label.text}-${label.x}`}
                className="loc__label"
                transform={`translate(${label.x} ${label.y}) rotate(${label.angle})`}
              >
                {label.text}
              </text>
            ))}
            <ellipse className="loc__halo" cx={PIN.x} cy={PIN.y} rx={14} ry={5} />
            <g transform={`translate(${PIN.x} ${PIN.y})`}>
              <g className="loc__pin">
                <g transform="scale(3.4) translate(-12 -22)">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" />
                  <circle cx="12" cy="9" r="2.6" fill="var(--loc-pin-dot)" />
                </g>
              </g>
              <text className="loc__pin-label" x="-46" y="-40">
                {name}
              </text>
            </g>
          </svg>
        </div>

        {/* Cara contraída: oculta para lectores de pantalla al expandirse (la información sale en la otra capa). */}
        <div className="loc__face" aria-hidden={expanded}>
          <div className="loc__top">
            <span className="loc__icon">
              <Icon name="pin" size={20} />
            </span>
            <span className="loc__tag">
              <span className="loc__dot" aria-hidden="true" />
              {tag}
            </span>
          </div>
          <div className="loc__bottom">
            <p className="loc__name">{name}</p>
            <span className="loc__line" aria-hidden="true" />
          </div>
        </div>

        {/* Un solo botón cubre y alterna la tarjeta. */}
        <button ref={toggleRef} type="button" className="loc__toggle" aria-expanded={expanded} onClick={toggle}>
          <span className="visually-hidden">{ui.toggle(name)}</span>
        </button>
        <span className="loc__close" aria-hidden="true">
          <Icon name="close" size={18} />
        </span>

      </div>

      <p className="loc__hint" aria-hidden="true">
        {ui.hint}
      </p>
    </div>
  )
}
