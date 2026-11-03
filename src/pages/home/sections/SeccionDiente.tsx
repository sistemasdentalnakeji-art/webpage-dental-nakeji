// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN DEBAJO DEL HERO: tres mensajes ("un hilo de sonrisa") sobre el fondo de partículas
//
//   1. Deseo cotidiano → a la izquierda.
//   2. Lo importante del cuidado (h2) → centrado.
//   3. Comprender para decidir → a la derecha.
// • Sus palabras aparecen una tras otra pasando de borrosas a nítidas (text blur reveal); las frases en azul se subrayan
//   con una línea fina amarilla al hacer scroll; y un hilo de tramos rectos con vueltas en semicírculo (con el estilo de las líneas de
//   Agendar, recorrido por una luz) se va cargando con el scroll de un mensaje al siguiente.
// • Textos → src/data/story.ts.
// • Movimiento y estilos → src/styles/pages/home/story.css (animaciones CSS ligadas al scroll). Navegadores sin
//   `animation-timeline` (Safari anterior a 26, p. ej. iPhone 12): un efecto mide el scroll y pone `--story-p` (0 a 1) en el
//   área; story.css lo usa para mover el hilo y el diente (clase `story--scrub`).
// • El trazado del hilo se calcula con las cajas reales del texto (cualquier idioma y ancho) para no tocarlo:
//   src/lib/storyThread.ts (prueba en tests/story-thread.spec.ts).
// ─────────────────────────────────────────────────────────────────────────────

import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from 'react'
import { useLang } from '@/app/lang'
import { STORY, type StoryLines } from '@/data/story'
import { AnimatedLines, type Line } from '@/components/decor/SectionDecor'
import { Band } from '@/components/decor/Band'
import { ParticlesBackground } from '@/components/decor/ParticlesBackground'
import { storyThread, type StoryLayout } from '@/lib/storyThread'
import { below, BP } from '@/config/breakpoints'

/** Ancho del área (px) por debajo del cual el hilo pasa más pegado al texto (celular: el texto llega casi a la orilla). */
const NARROW_AREA = 740

// Antes de medir (prerender y primer render) el hilo se dibuja en un lienzo de 100×100 estirado, con cajas aproximadas.
const ROUGH_LAYOUT: StoryLayout = {
  width: 100,
  height: 100,
  outside: 2,
  gap: 2,
  boxes: [
    { left: 3, right: 90, top: 0, bottom: 26 },
    { left: 15, right: 85, top: 43, bottom: 63 },
    { left: 30, right: 95, top: 80, bottom: 100 },
  ],
}

/** Destello de cuatro puntas (como el del emoji ✨), viewBox 24×24. */
const SPARKLE = 'M12 0C12.8 6.5 17.5 11.2 24 12C17.5 12.8 12.8 17.5 12 24C11.2 17.5 6.5 12.8 0 12C6.5 11.2 11.2 6.5 12 0Z'

/** Silueta del diente de caricatura (viewBox 80×84): corona redonda con dos lomos arriba y dos raíces cortas y anchas. */
const TOOTH_SHAPE =
  'M40 15C33 7 12 6 10 26C9 38 16 45 18 56C19 66 22 76 28 76C34 76 35 63 40 63C45 63 46 76 52 76C58 76 61 66 62 56C64 45 71 38 70 26C68 6 47 7 40 15Z'

/** Capas del volumen: copias de la silueta apiladas en profundidad (la primera y la última son las caras). */
const TOOTH_LAYERS = 7

/**
 * Diente de caricatura con volumen (CSS 3D, sin WebGL): copias SVG de la silueta apiladas en Z, con los lados casi blancos
 * (perla) y las dos caras con degradado y brillo. Se mece de lado a lado con el scroll (story.css).
 */
function Tooth() {
  return (
    <div className="story__tooth" aria-hidden="true">
      <svg className="story__tooth-defs" width="0" height="0" focusable="false">
        <defs>
          <radialGradient id="story-tooth-face" cx="35%" cy="28%" r="80%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#f6f9fd" />
            <stop offset="1" stopColor="#d3e3f3" />
          </radialGradient>
        </defs>
      </svg>
      <div className="story__tooth-body">
        {Array.from({ length: TOOTH_LAYERS }, (_, i) => {
          const face = i === 0 || i === TOOTH_LAYERS - 1
          return (
            <svg
              key={i}
              className={face ? 'story__tooth-layer story__tooth-layer--face' : 'story__tooth-layer'}
              style={{ '--z': i - (TOOTH_LAYERS - 1) / 2 } as CSSProperties}
              viewBox="0 0 80 84"
              focusable="false"
            >
              <path d={TOOTH_SHAPE} />
              {face && (
                <>
                  <ellipse className="story__tooth-gloss" cx="26" cy="23" rx="9" ry="5" transform="rotate(-28 26 23)" />
                  <path className="story__tooth-gloss" d="M17 40C17.5 45 19.5 49 20.5 53" />
                </>
              )}
            </svg>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Punta del hilo: una caja que recorre la curva al hacer scroll (`offset-path` = la misma curva, en píxeles; el avance lo
 * hace story.css con la misma línea de tiempo que revela el hilo). Lleva el diente y tres destellos que titilan.
 */
function ThreadTip({ path }: { path?: string }) {
  return (
    <div
      className="story__tip"
      data-ready={path ? '' : undefined}
      style={path ? { offsetPath: `path('${path}')` } : undefined}
      aria-hidden="true"
    >
      <Tooth />
      {[1, 2, 3].map((n) => (
        <svg key={n} className={`tooth-sparkle tooth-sparkle--${n}`} viewBox="0 0 24 24" focusable="false">
          <path d={SPARKLE} />
        </svg>
      ))}
    </div>
  )
}

/** Posición (px) de un elemento dentro de `area`, sin contar transformaciones (las palabras se mueven al animarse). */
function offsetIn(el: HTMLElement, area: HTMLElement) {
  let x = 0
  let y = 0
  for (let node: HTMLElement | null = el; node && node !== area; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft
    y += node.offsetTop
  }
  return { x, y }
}

/**
 * Mide el área de los mensajes y la caja del texto de cada uno (sus palabras). Hasta medirla (prerender y primer render) es
 * `null`; después, el hilo se dibuja en píxeles reales: así la máscara que lo revela y la ruta del diente coinciden.
 * Se vuelve a medir al cambiar de tamaño, al cargar las fuentes y al cambiar de idioma (`text`).
 */
function useStoryLayout(text: unknown) {
  const ref = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<StoryLayout | null>(null)

  useEffect(() => {
    const area = ref.current
    if (!area) return
    const measure = () => {
      const items = [...area.querySelectorAll<HTMLElement>('.story__item')]
      const boxes = items.map((item) => {
        const words = [...item.querySelectorAll<HTMLElement>('.story__word')].map((word) => ({ ...offsetIn(word, area), word }))
        const { y: top } = offsetIn(item, area)
        return {
          left: Math.min(...words.map(({ x }) => x)),
          right: Math.max(...words.map(({ x, word }) => x + word.offsetWidth)),
          top,
          bottom: top + item.offsetHeight,
        }
      })
      // Cuánto puede salir el hilo del área: hasta la orilla de la sección (que recorta), menos un respiro.
      const band = area.closest('section')?.getBoundingClientRect()
      const rect = area.getBoundingClientRect()
      const outside = band ? Math.max(0, Math.min(rect.left - band.left, band.right - rect.right) - 4) : 0
      const width = area.clientWidth
      setLayout({ width, height: area.clientHeight, boxes, outside, gap: width < NARROW_AREA ? 8 : 24 })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(area)
    void document.fonts?.ready.then(measure)
    return () => observer.disconnect()
  }, [text])

  return [ref, layout] as const
}

/** Cada palabra lleva su número (--i, contando desde la primera del mensaje) para aparecer en cascada. */
function StoryText({ lines }: { lines: StoryLines }) {
  let index = 0
  const words = (text: string) =>
    text
      .split(' ')
      .filter(Boolean)
      .map((word) => {
        const i = index++
        // El espacio va FUERA del span: dentro de un inline-block se colapsaría y las palabras saldrían pegadas.
        return (
          <Fragment key={i}>
            <span className="story__word" style={{ '--i': i } as CSSProperties}>
              {word}
            </span>{' '}
          </Fragment>
        )
      })

  return lines.map((segments, lineIndex) => (
    // data-indent: el CSS deja en blanco el ancho de ese texto (contenido generado, no forma parte del texto de la página)
    // para que la línea empiece justo debajo de esas palabras.
    <span key={lineIndex} className="story__line" data-indent={segments.find((segment) => segment.indent)?.indent}>
      {segments.map((segment) =>
        segment.accent ? (
          <span key={segment.text} className="story__accent">
            {words(segment.text)}
          </span>
        ) : (
          <Fragment key={segment.text}>{words(segment.text)}</Fragment>
        ),
      )}
    </span>
  ))
}

const noSubscribe = () => () => {}

/** ¿Hace falta el respaldo? Sí si el navegador no tiene `animation-timeline` o es un celular, salvo "reducir movimiento". */
const needsScrub = () =>
  // Celular: el diente no seguía el `offset-path` (se quedaba en la esquina), así que ahí siempre se coloca con JS.
  (!CSS.supports('animation-timeline', 'view()') || window.matchMedia(below(BP.md)).matches) &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Respaldo del scroll para navegadores sin `animation-timeline` (Safari anterior a 26): calcula el mismo avance que la línea
 * de tiempo `view()` de story.css (hilo y diente: del 12 % al 80 % del recorrido, ignorando el 30 % inferior de la
 * pantalla) y lo deja en `--story-p`. Devuelve `true` cuando está activo. Con "reducir movimiento" no se activa.
 */
function useScrollScrub(areaRef: RefObject<HTMLDivElement | null>, threadD?: string) {
  // En el servidor (prerender) vale false; ya en el navegador se calcula una vez (sin setState dentro de un efecto).
  const scrub = useSyncExternalStore(noSubscribe, needsScrub, () => false)

  useEffect(() => {
    const area = areaRef.current
    if (!area || !scrub) return

    // La punta (diente) se coloca con JS sobre la misma curva: `offset-path` no es fiable en todos los navegadores (en el
    // iPhone del cliente el diente salía fuera del trazo). `getPointAtLength` da el punto exacto de la curva.
    const curve = threadD ? document.createElementNS('http://www.w3.org/2000/svg', 'path') : null
    curve?.setAttribute('d', threadD ?? '')
    const length = curve ? curve.getTotalLength() : 0

    let frame = 0
    const update = () => {
      frame = 0
      const { top, height } = area.getBoundingClientRect()
      const end = window.innerHeight * 0.7
      const cover = (end - top) / (height + end)
      const progress = Math.min(1, Math.max(0, (cover - 0.12) / 0.68))
      area.style.setProperty('--story-p', progress.toFixed(4))
      if (curve) {
        const point = curve.getPointAtLength(progress * length)
        area.style.setProperty('--tip-x', `${point.x.toFixed(1)}px`)
        area.style.setProperty('--tip-y', `${point.y.toFixed(1)}px`)
        area.style.setProperty('--tip-o', Math.min(1, progress / 0.06).toFixed(3))
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    // El área puede cambiar de alto sin scroll ni resize (p. ej. al cargar las fuentes): se recalcula el avance.
    const resizeObserver = new ResizeObserver(onScroll)
    resizeObserver.observe(area)
    return () => {
      resizeObserver.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      for (const name of ['--story-p', '--tip-x', '--tip-y', '--tip-o']) area.style.removeProperty(name)
    }
  }, [areaRef, scrub, threadD])

  return scrub
}

export function SeccionDiente() {
  const story = STORY[useLang()]
  const [areaRef, layout] = useStoryLayout(story)
  // Sin ondular: la forma `b` es igual a la `a` para que los tramos sigan rectos.
  const { d } = storyThread(layout ?? ROUGH_LAYOUT)
  const thread: Line[] = [{ a: d, b: d }]
  const scrub = useScrollScrub(areaRef, layout ? d : undefined)

  return (
    <Band tone="tint" className="story" labelledBy="historia-titulo" decor={<ParticlesBackground avoid=".story__tip" />}>
      <div ref={areaRef} className={scrub ? 'container story__inner story--scrub' : 'container story__inner'}>
        {/* Hilo decorativo: curva animada como las de Agendar, que se va dibujando con el scroll (máscara .decor-reveal)
            con el diente en la punta. */}
        <AnimatedLines
          lines={thread}
          className="decor story__thread"
          viewBox={layout ? `0 0 ${layout.width} ${layout.height}` : '0 0 100 100'}
          revealId="story-thread-reveal"
        />
        <ThreadTip path={layout ? d : undefined} />

        <p className="story__item story__item--left">
          <StoryText lines={story.desire} />
        </p>

        <h2 id="historia-titulo" className="story__item story__item--up">
          <StoryText lines={story.priority} />
        </h2>

        <p className="story__item story__item--right">
          <StoryText lines={story.decision} />
        </p>
      </div>
    </Band>
  )
}
