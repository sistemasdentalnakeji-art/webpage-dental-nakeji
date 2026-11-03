// Trazado del hilo del diente (pages/home/sections/SeccionDiente.tsx), sin pantalla: la prueba está en tests/story-thread.spec.ts.
//
// El hilo va por tramos horizontales unidos por vueltas en semicírculo (C): arriba del mensaje 1 hacia la derecha, vuelta
// por la derecha del 1, cruce a la izquierda por el hueco entre el 1 y el 2, vuelta por la izquierda del 2, cruce a la
// derecha por el hueco entre el 2 y el 3, vuelta por la derecha del 3 y regreso por debajo hasta el diente.
// Cada vuelta se calcula con la caja real del texto (en cualquier idioma y ancho) para no tocarlo: es un círculo si cabe y,
// si no cabe en el espacio libre del costado, se aplana en semielipse.

/** Caja del texto de un mensaje, en px relativos al área de los mensajes. */
export interface TextBox {
  left: number
  right: number
  top: number
  bottom: number
}

export interface StoryLayout {
  width: number
  height: number
  /** Los tres mensajes, en orden. */
  boxes: TextBox[]
  /** Px que el hilo puede salir del área por cada costado (el margen de la página). */
  outside: number
  /** Separación mínima (px) entre el hilo y el texto (menor en celular, donde el texto llega casi a la orilla). */
  gap: number
}

/** Distancia (px) del primer tramo sobre el mensaje 1 y del último bajo el mensaje 3. */
const LEAD_TOP = 64
const LEAD_BOTTOM = 56

interface Turn {
  /** x donde terminan los tramos horizontales (centro de la vuelta). */
  cx: number
  /** Cuánto sale la vuelta hacia el costado (= radio vertical si es un círculo). */
  rx: number
  ry: number
  ya: number
  yb: number
}

/**
 * Vuelta entre las alturas `ya` y `yb` por el costado `side` (1 derecha, -1 izquierda) sin tocar `boxes`. En el lado
 * izquierdo se calcula como si fuera el derecho con las x en espejo.
 */
function turn(ya: number, yb: number, side: 1 | -1, { boxes, width, outside, gap }: StoryLayout): Turn {
  const ry = (yb - ya) / 2
  const ym = (ya + yb) / 2
  const limit = side === 1 ? width + outside : outside
  // Por cada texto que cae en la altura de la vuelta: su borde (en espejo si es el lado izquierdo) y `k`, la fracción del
  // radio que alcanza la vuelta en su punto más cercano al texto (1 a media altura, 0 en los extremos).
  const near = boxes
    .map((box) => {
      const top = Math.max(box.top, ya)
      const bottom = Math.min(box.bottom, yb)
      if (top >= bottom) return null
      const dy = Math.min(ry, Math.max(Math.abs(top - ym), Math.abs(bottom - ym)))
      return { edge: (side === 1 ? box.right : -box.left) + gap, k: Math.sqrt(1 - (dy / ry) ** 2) }
    })
    .filter((n) => n !== null)
  // Círculo si cabe; si no, se aplana lo justo para no salir del margen de la página.
  let rx = ry
  for (const { edge, k } of near) if (k < 1) rx = Math.min(rx, (limit - edge) / (1 - k))
  rx = Math.max(12, rx)
  const cx = near.length ? Math.max(...near.map(({ edge, k }) => edge - rx * k)) : limit - rx
  return { cx: side === 1 ? cx : -cx, rx, ry, ya, yb }
}

const f = (n: number) => n.toFixed(2)

/** Ruta SVG del hilo (en px del área) y las vueltas que usa (para la prueba). */
export function storyThread(layout: StoryLayout) {
  const [m1, m2, m3] = layout.boxes
  const y0 = m1.top - LEAD_TOP
  const g1 = (m1.bottom + m2.top) / 2
  const g2 = (m2.bottom + m3.top) / 2
  const y3 = m3.bottom + LEAD_BOTTOM
  const turns = [
    turn(y0, g1, 1, layout),
    turn(g1, g2, -1, layout),
    turn(g2, y3, 1, layout),
  ]
  // Empieza y termina hacia el primer tercio del ancho (el diente se detiene al final).
  const startX = Math.min(layout.width * 0.335, turns[0].cx - 40)
  const endX = Math.min(layout.width * 0.31, turns[2].cx - 40)
  let d = `M${f(startX)} ${f(y0)}`
  turns.forEach(({ cx, rx, ry, yb }, i) => {
    // Con y hacia abajo: por la derecha (de ir a la derecha a ir a la izquierda) el arco gira en sentido horario (sweep 1).
    d += `H${f(cx)}A${f(rx)} ${f(ry)} 0 0 ${i === 1 ? 0 : 1} ${f(cx)} ${f(yb)}`
  })
  return { d: `${d}H${f(endX)}`, turns }
}

/** x de una vuelta a la altura `y` (su punto sobre el semicírculo o la semielipse). */
export function turnXAt({ cx, rx, ry, ya, yb }: Turn, side: 1 | -1, y: number) {
  const t = (y - (ya + yb) / 2) / ry
  return cx + side * rx * Math.sqrt(Math.max(0, 1 - t * t))
}
