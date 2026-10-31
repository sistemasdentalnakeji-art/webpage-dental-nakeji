// Colores de prisma de la marca para el fondo de partículas (ParticlesBackground).

// Paleta de la marca (tokens.css): oro base, blanco, azul claro del isotipo y azul del isotipo.
export const GOLD = [224, 182, 92]
export const WHITE = [255, 255, 255]
export const SKY = [123, 195, 235]
export const BRAND = [58, 112, 176]
/** Ida y vuelta por la paleta (oro → blanco → azul claro → azul → …): así nunca pasa por mezclas grises. */
const CYCLE = [GOLD, WHITE, SKY, BRAND]
export const rgba = ([r, g, b]: number[], a: number) => `rgba(${r}, ${g}, ${b}, ${Math.max(0, a)})`

/** Color de la paleta en `u` (cualquier número; avanza y regresa). */
export function paletteAt(u: number) {
  let t = ((u % 2) + 2) % 2
  if (t > 1) t = 2 - t
  const x = t * (CYCLE.length - 1)
  const i = Math.min(CYCLE.length - 2, Math.floor(x))
  const f = x - i
  return CYCLE[i].map((c, k) => Math.round(c + (CYCLE[i + 1][k] - c) * f))
}

