// Comparador antes/después: dos recortes encimados; la línea dorada se arrastra (o se mueve con las flechas, es un
// <input type="range">) y descubre el "después". Datos → src/data/beforeAfter.ts. Estilos → service.css.
import { useState, type CSSProperties } from 'react'
import { useLang } from '@/app/lang'
import { BEFORE_AFTER_TEXT, type BeforeAfterCrop, type BeforeAfterPhoto } from '@/data/beforeAfter'

// La foto se escala para que el recorte llene la caja y se desplaza hasta él.
const cropStyle = (c: BeforeAfterCrop): CSSProperties => ({
  width: `${(c.width / c.w) * 100}%`,
  height: `${(c.height / c.h) * 100}%`,
  left: `${(-c.x / c.w) * 100}%`,
  top: `${(-c.y / c.h) * 100}%`,
})

export function BeforeAfter({ photo }: { photo: BeforeAfterPhoto }) {
  const lang = useLang()
  const text = BEFORE_AFTER_TEXT[lang]
  const [pos, setPos] = useState(50)
  const { before, after } = photo

  return (
    <div className="before-after-wrap">
      <figure className="before-after" style={{ '--pos': `${pos}%`, aspectRatio: `${before.w} / ${before.h}` } as CSSProperties}>
        <img src={before.src} alt={photo.alt[lang]} style={cropStyle(before)} loading="lazy" decoding="async" />
        <div className="before-after__after" aria-hidden="true">
          <img src={after.src} alt="" style={cropStyle(after)} loading="lazy" decoding="async" />
        </div>
        <span className="before-after__tag before-after__tag--before">{text.before}</span>
        <span className="before-after__tag before-after__tag--after">{text.after}</span>
        <span className="before-after__handle" aria-hidden="true" />
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          aria-label={text.slider}
          onChange={(e) => setPos(Number(e.target.value))}
        />
      </figure>
    </div>
  )
}
