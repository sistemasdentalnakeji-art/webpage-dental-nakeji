import { useRef, type CSSProperties } from 'react'
import { cx } from '@/lib/cx'
import { Rings, type RingsPlacement } from './rings/Rings'
import { EASE_IN_OUT, useSmilMotion } from './useSmilMotion'

// Decoraciones curvas para el fondo de las bandas (solo visuales, de un solo color).
// - rings: círculo con siluetas (ver ./rings/Rings.tsx).
// - wave: ola a todo lo ancho; une una banda con la siguiente.

type SectionDecorProps =
  | { variant: 'rings'; placement: RingsPlacement }
  /** inverse: rellena por encima de la curva (sin voltear); lo usa el footer para que sus hilos lleguen a la ola. */
  | { variant: 'wave'; position: 'top' | 'bottom'; flip?: boolean; inverse?: boolean }

export interface Line {
  /** Forma inicial y forma intermedia de la curva (se alternan suavemente). */
  a: string
  b: string
}

interface AnimatedLinesProps {
  lines: Line[]
  className: string
  viewBox: string
  /**
   * Opcional (hilo de la historia animada): id de una máscara que sigue las mismas curvas. Su trazo (`.decor-reveal`,
   * `pathLength` 1) se anima desde CSS con `stroke-dashoffset` para ir mostrando las curvas a lo largo de su recorrido.
   */
  revealId?: string
}

/** Curvas animadas (ondulan y las recorre una luz). Las usan las curvas de Agendar y el hilo de la historia animada. */
export function AnimatedLines({ lines, className, viewBox, revealId }: AnimatedLinesProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  useSmilMotion(svgRef)

  const wave = (line: Line, index: number) => (
    <animate
      attributeName="d"
      values={`${line.a};${line.b};${line.a}`}
      keyTimes="0;0.5;1"
      calcMode="spline"
      keySplines={EASE_IN_OUT}
      dur={`${14 + index * 1.7}s`}
      begin={`-${index * 2.3}s`}
      repeatCount="indefinite"
    />
  )

  return (
    <svg ref={svgRef} className={className} viewBox={viewBox} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {revealId && (
        <mask id={revealId} maskUnits="userSpaceOnUse" x="-5000" y="-5000" width="10000" height="10000">
          {lines.map((line, index) => (
            <path key={index} className="decor-reveal" d={line.a} pathLength={1}>
              {wave(line, index)}
            </path>
          ))}
        </mask>
      )}
      <g mask={revealId && `url(#${revealId})`}>
        {lines.map((line, index) => (
          <g key={index} style={{ '--i': index } as CSSProperties}>
            <path className="decor-line" d={line.a} vectorEffect="non-scaling-stroke">
              {wave(line, index)}
            </path>
            <path className="decor-line__light" d={line.a} vectorEffect="non-scaling-stroke">
              {wave(line, index)}
            </path>
          </g>
        ))}
      </g>
    </svg>
  )
}

export function SectionDecor(props: SectionDecorProps) {
  switch (props.variant) {
    case 'rings':
      return <Rings placement={props.placement} />

    case 'wave':
      return (
        <svg
          className={cx(
            'decor decor--wave',
            `decor--${props.position}`,
            props.flip && 'decor--flip',
            props.inverse && 'decor--inverse',
          )}
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="currentColor"
            d={props.inverse ? 'M0 110C220 40 470 40 720 96s500 100 720 20V0H0z' : 'M0 110C220 40 470 40 720 96s500 100 720 20v84H0z'}
          />
        </svg>
      )
  }
}
