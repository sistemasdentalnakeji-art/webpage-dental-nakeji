import type { CSSProperties } from 'react'

/** Entrada de título palabra por palabra (desenfoque + fundido), basada en "Text Blur Reveal" de Wensity (21st.dev).
 *  `start` continúa el retraso cuando un mismo título se parte en varios tramos. */
export function TextBlurReveal({ text, start = 0 }: { text: string; start?: number }) {
  return text.split(' ').map((word, index) => (
    <span key={index}>
      {index > 0 && ' '}
      <span className="text-blur-reveal" style={{ '--word': start + index } as CSSProperties}>
        {word}
      </span>
    </span>
  ))
}
