import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { SectionDecor } from '@/components/decor/SectionDecor'

type Wave = 'plain' | 'flip'

interface BandProps {
  /** gradient: sin fondo propio, deja ver el degradado azul fijo de la página (PageGradient en App.tsx). Con algo fijo dentro (PagePlasma) sumar la clase band--clip. */
  tone: 'white' | 'tint' | 'night' | 'gradient'
  id?: string
  labelledBy: string
  className?: string
  /** Ola propia en el borde superior (une la banda con la anterior). */
  waveTop?: Wave
  /** Decoración extra de fondo (arcos, anillos). */
  decor?: ReactNode
  children: ReactNode
}

/**
 * Sección de la hoja continua: fondo blanco, azul claro, azul noche o degradado fijo, olas de unión y decoraciones.
 * Une las clases de la banda (tono, ola superior) con las decoraciones que se pintan dentro (`SectionDecor`).
 */
export function Band({ tone, id, labelledBy, className, waveTop, decor, children }: BandProps) {
  return (
    <section
      id={id}
      className={cx(className, 'band', `band--${tone}`, waveTop && 'band--wave-top')}
      aria-labelledby={labelledBy}
    >
      {decor}
      {waveTop && <SectionDecor variant="wave" position="top" flip={waveTop === 'flip'} />}
      {children}
    </section>
  )
}
