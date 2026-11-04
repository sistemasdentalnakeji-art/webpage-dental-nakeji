// ─────────────────────────────────────────────────────────────────────────────
// SPIN SHUTTER: una órbita de fotos que se abre girando desde una pila y enfoca la que pasa al frente.
// Inspirado en "Spin Shutter" de React Bits Pro (bloque de pago, NO instalado: su versión de shadcn pide Tailwind, que este
// proyecto no usa). Código propio, sin librerías, con las ideas de su documentación:
//   • al entrar a pantalla las fotos se abren desde una pila (`--ss-spread` animado) mientras la órbita gira rápido y frena;
//   • la órbita va inclinada en diagonal (`tilt` hacia la cámara + `roll` en pantalla), como en la página oficial: un arco cercano
//     de fotos grandes y nítidas y otro lejano de fotos chicas, difuminadas y apagadas. Las fotos miran siempre de frente
//     (se contra-giran), solo cambia su tamaño por la perspectiva;
//   • con el cursor encima la órbita "rebota": se inclina un poco hacia donde apuntas y vuelve;
//     se puede arrastrar (con inercia) y los botones anterior/siguiente llevan la foto elegida al frente.
//   • un clic despliega la foto dentro del panel, con el mismo resorte que LocationMap; al cerrar vuelve a su lugar.
//   • NO se mueve con la rueda del mouse (se la quitaría al scroll de la página).
// • Sin movimiento ("reducir movimiento" o "Pausar animaciones"): la órbita queda quieta y completa; los botones cambian de
//   foto sin animar. Se renderiza también en Node: nada de window/document fuera de efectos y eventos.
// • Fotos → quien lo use (hoy src/data/servicesShowcase.ts). Estilos → src/styles/components/spin-shutter.css.
// • El giro vive en variables CSS del anillo (--spin, --tilt, --roll) que escribe un bucle requestAnimationFrame: React no se
//   vuelve a pintar mientras gira.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react'
import { useLang } from '@/app/lang'
import { UI } from '@/data/ui'
import { Icon } from '@/components/ui/Icon'
import { AuroraBackground } from '@/components/decor/AuroraBackground'
import { motionOff } from '@/lib/motion'
import { below, BP } from '@/config/breakpoints'

export interface SpinShutterPhoto {
  src: string
  alt: string
  /** object-position de la foto dentro de la tarjeta. */
  position?: string
}

interface Props {
  photos: SpinShutterPhoto[]
  /** Nombre de la región para lectores de pantalla. */
  label: string
  /** Vueltas por minuto del giro automático. */
  speed?: number
  /** Inclinación de la órbita hacia la cámara, en grados (0 = de canto, una línea; 90 = de frente, un círculo). */
  tilt?: number
  /** Giro de la órbita sobre la pantalla, en grados: con valor positivo el arco cercano queda a la izquierda y el eje mayor baja a la derecha. */
  roll?: number
}

const RAD = Math.PI / 180
const DEG_PER_PX = 0.32 // lo que gira la órbita por píxel arrastrado
const HOLD_MS = 4500 // tras elegir una foto a mano, el giro automático espera
const INTRO_SPIN = 560 // grados por segundo con los que arranca el giro al abrirse; frena solo
const DRAG_START_PX = 8 // hasta moverse esto, es un toque o clic; más, es un arrastre
const WOBBLE_DEG = 7 // cuánto se inclina la órbita hacia el cursor

/** Apagado y desenfoque de una foto según qué tan al frente está (c = coseno de su ángulo: 1 al frente, -1 atrás).
 *  El desenfoque va en pasos de 0.5 px y solo se reescribe si cambió: un filtro nuevo cada frame sale caro en equipos modestos.
 *  En celular no hay desenfoque (solo apagado): repintar filtros en cada vuelta trababa el giro. */
function depthStyle(card: HTMLElement, c: number, blurOn: boolean) {
  const t = (c + 1) / 2
  const blur = blurOn ? Math.round((1 - t) ** 1.3 * 3.5 * 2) / 2 : 0
  card.style.opacity = (0.22 + 0.78 * t ** 1.6).toFixed(3)
  const filter = blur > 0 ? `blur(${blur}px)` : 'none'
  if (card.style.filter !== filter) card.style.filter = filter
}

export function SpinShutter({ photos, label, speed = 2.2, tilt = 30, roll = 26 }: Props) {
  const { spin: ui, carousel } = UI[useLang()]
  const count = photos.length
  const step = 360 / count
  const rootRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([])
  const previewId = useId()
  const previewRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const [expandedPhoto, setExpandedPhoto] = useState<SpinShutterPhoto | null>(null)

  // Estado del giro (en refs: se actualiza 60 veces por segundo sin volver a pintar React).
  const angle = useRef(0)
  const velocity = useRef(0)
  const snapTo = useRef<number | null>(null)
  const holdUntil = useRef(0)
  const focusWithin = useRef(false)
  const pressed = useRef(false) // botón o dedo abajo sobre el escenario (aún puede ser un simple clic)
  const dragging = useRef(false) // ya se movió lo bastante: es un arrastre
  const dragLast = useRef({ x: 0, t: 0 })
  const dragMoved = useRef(0)
  const targetIndex = useRef(0) // foto a la que va (o está) la órbita: dos clics seguidos avanzan dos
  const frontIndex = useRef(0) // la foto que hoy está al frente
  const wobbleTarget = useRef({ tilt: 0, roll: 0 })

  useEffect(() => {
    const root = rootRef.current
    const ring = ringRef.current
    if (!root || !ring) return

    let frame = 0
    let last = 0
    let painted = ''
    const wobble = { tilt: 0, roll: 0 }
    const blurOn = !window.matchMedia(below(BP.md)).matches
    let opened = motionOff() // sin movimiento no hay apertura: la órbita ya está completa
    // Si cambia a "sin movimiento" mientras está en pila y fuera de pantalla, al verse queda completa y sin transición.
    const finishOpen = () => {
      opened = true
      root.dataset.phase = 'static'
    }

    const paint = () => {
      const key = `${angle.current.toFixed(3)}|${wobble.tilt.toFixed(3)}|${wobble.roll.toFixed(3)}`
      if (key === painted) return
      painted = key
      ring.style.setProperty('--spin', `${angle.current.toFixed(3)}deg`)
      ring.style.setProperty('--tilt', `${(tilt + wobble.tilt).toFixed(3)}deg`)
      ring.style.setProperty('--roll', `${(roll + wobble.roll).toFixed(3)}deg`)
      let nearest = 0
      let best = -2
      cardRefs.current.forEach((card, k) => {
        if (!card) return
        const c = Math.cos((k * step + angle.current) * RAD)
        depthStyle(card, c, blurOn)
        if (c > best) {
          best = c
          nearest = k
        }
      })
      frontIndex.current = nearest
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (openerRef.current) {
        frame = requestAnimationFrame(tick)
        return
      }
      const still = motionOff()
      if (snapTo.current !== null) {
        const diff = snapTo.current - angle.current
        if (still || Math.abs(diff) < 0.05) {
          angle.current = snapTo.current
          snapTo.current = null
          velocity.current = 0
        } else {
          angle.current += diff * Math.min(1, dt * 7)
        }
      } else if (!dragging.current) {
        const resting = still || focusWithin.current || now < holdUntil.current
        const target = resting ? 0 : speed * 6
        velocity.current += (target - velocity.current) * Math.min(1, dt * 2.5)
        angle.current += velocity.current * dt
      }
      // Rebote: la inclinación sigue al cursor con un resorte suave (pasa un poco y vuelve) y se aquieta sola al salir.
      const ease = Math.min(1, dt * 5)
      wobble.tilt += ((still ? 0 : wobbleTarget.current.tilt) - wobble.tilt) * ease
      wobble.roll += ((still ? 0 : wobbleTarget.current.roll) - wobble.roll) * ease
      paint()
      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (frame) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    // El servidor emite la pila (data-phase="stacked"); sin movimiento queda completa desde ya, con movimiento se abre la primera vez que se ve.
    if (opened) finishOpen()
    paint()

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return stop()
        if (!opened) {
          if (motionOff()) finishOpen()
          else {
            opened = true
            root.dataset.phase = 'open'
            velocity.current = INTRO_SPIN
          }
        }
        start()
      },
      { threshold: 0.25 },
    )
    observer.observe(root)
    return () => {
      observer.disconnect()
      stop()
    }
  }, [count, step, speed, tilt, roll])

  useEffect(() => {
    const preview = previewRef.current
    if (!preview) return
    if (expandedPhoto) {
      // Fija el recuadro de origen antes de desplegarlo hasta los bordes del panel.
      preview.getBoundingClientRect()
      preview.dataset.expanded = 'true'
      closeRef.current?.focus({ preventScroll: true })
    } else if (openerRef.current) {
      openerRef.current = null
      holdUntil.current = 0
      velocity.current = motionOff() || focusWithin.current ? 0 : speed * 6
    }

    return () => window.clearTimeout(closeTimer.current)
  }, [expandedPhoto, speed])

  const setPhotoOrigin = (button: HTMLButtonElement) => {
    const root = rootRef.current
    const preview = previewRef.current
    if (!root || !preview) return
    const panel = root.getBoundingClientRect()
    const source = button.getBoundingClientRect()
    preview.style.setProperty('--photo-x', `${source.left - panel.left}px`)
    preview.style.setProperty('--photo-y', `${source.top - panel.top}px`)
    preview.style.setProperty('--photo-width', `${source.width}px`)
    preview.style.setProperty('--photo-height', `${source.height}px`)
  }

  const openPhoto = (event: MouseEvent<HTMLButtonElement>, photo: SpinShutterPhoto) => {
    // pointerup ya soltó el arrastre; la distancia conserva la diferencia entre arrastrar y pulsar.
    if (event.detail !== 0 && dragMoved.current >= DRAG_START_PX) return
    const preview = previewRef.current
    if (!preview) return
    preview.style.transition = 'none'
    setPhotoOrigin(event.currentTarget)
    preview.getBoundingClientRect()
    preview.style.removeProperty('transition')
    openerRef.current = event.currentTarget
    velocity.current = 0
    snapTo.current = null
    setExpandedPhoto(photo)
  }

  /** Dentro del visor: pasa a la foto anterior/siguiente. Al cerrar, vuelve a la tarjeta de la foto que quedó abierta. */
  const stepPhoto = (delta: number) => {
    if (!expandedPhoto) return
    const k = (((photos.indexOf(expandedPhoto) + delta) % count) + count) % count
    openerRef.current = cardRefs.current[k] ?? openerRef.current
    setExpandedPhoto(photos[k])
  }

  const finishPhotoClose = () => {
    if (previewRef.current?.contains(document.activeElement)) {
      const opener = openerRef.current
      opener?.closest('.spin-shutter__stage')?.removeAttribute('inert')
      opener?.focus({ preventScroll: true })
    }
    setExpandedPhoto(null)
  }

  const closePhoto = () => {
    const preview = previewRef.current
    if (!preview?.hasAttribute('data-expanded')) return
    if (openerRef.current) setPhotoOrigin(openerRef.current)
    preview.removeAttribute('data-expanded')
    if (motionOff()) finishPhotoClose()
    // Respaldo si la transición se cancela al cambiar las preferencias de movimiento.
    else closeTimer.current = window.setTimeout(finishPhotoClose, 750)
  }

  /** Lleva la foto `index` al frente por el camino más corto. */
  const goTo = (index: number, now: number) => {
    const k = ((index % count) + count) % count
    targetIndex.current = k
    const base = -k * step
    snapTo.current = base + 360 * Math.round((angle.current - base) / 360)
    holdUntil.current = now + HOLD_MS
  }

  /** Anterior / siguiente parten de la foto a la que ya va la órbita (si no, dos clics rápidos avanzarían uno). */
  const goBy = (delta: number, now: number) => goTo((snapTo.current !== null ? targetIndex.current : frontIndex.current) + delta, now)

  // Arrastre con inercia. El puntero solo se captura cuando ya se movió (DRAG_START_PX).
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    pressed.current = true
    dragging.current = false
    dragMoved.current = 0
    dragLast.current = { x: event.clientX, t: performance.now() }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    // Rebote: con el mouse, la órbita se inclina hacia donde apunta el cursor (de -1 a 1 desde el centro del escenario).
    if (event.pointerType === 'mouse') {
      const box = event.currentTarget.getBoundingClientRect()
      const nx = ((event.clientX - box.left) / box.width) * 2 - 1
      const ny = ((event.clientY - box.top) / box.height) * 2 - 1
      wobbleTarget.current = { tilt: ny * WOBBLE_DEG, roll: nx * WOBBLE_DEG }
    }
    if (!pressed.current) return
    const now = performance.now()
    const dx = event.clientX - dragLast.current.x
    if (!dragging.current) {
      dragMoved.current = Math.abs(dx)
      if (dragMoved.current < DRAG_START_PX) return
      dragging.current = true
      snapTo.current = null
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    angle.current += dx * DEG_PER_PX
    const dt = Math.max(1, now - dragLast.current.t) / 1000
    velocity.current = Math.max(-720, Math.min(720, (dx * DEG_PER_PX) / dt))
    dragLast.current = { x: event.clientX, t: now }
  }

  // Se llama al soltar, al cancelarse el gesto y al perderse la captura (así la órbita nunca queda "agarrada").
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!pressed.current) return
    pressed.current = false
    if (!dragging.current) return
    dragging.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    // Si el dedo o el mouse se detuvo antes de soltar, no hay inercia; con "reducir movimiento" tampoco.
    if (performance.now() - dragLast.current.t > 80 || motionOff()) velocity.current = 0
    holdUntil.current = performance.now() + HOLD_MS
  }

  return (
    <div
      ref={rootRef}
      className="spin-shutter"
      role="group"
      aria-roledescription={carousel.role}
      aria-label={label}
      data-phase="stacked"
      // El giro automático espera mientras el foco del teclado está dentro de los botones.
      // Solo el foco de teclado detiene el giro: un clic con el mouse también enfoca el botón y lo dejaría parado.
      onFocus={(event) => (focusWithin.current = event.target.matches(':focus-visible'))}
      onBlur={() => (focusWithin.current = false)}
      onKeyDown={(event) => {
        if (!expandedPhoto) return
        if (event.key === 'Escape') {
          event.preventDefault()
          closePhoto()
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          stepPhoto(event.key === 'ArrowLeft' ? -1 : 1)
        }
      }}
    >
      <AuroraBackground theme="dark" className="spin-shutter__aurora" />
      <AuroraBackground theme="dark" effect="fibers" fiberCount={9} className="spin-shutter__fibers" />
      <div
        className="spin-shutter__stage"
        inert={!!expandedPhoto}
        style={{ '--n': count, '--tilt': `${tilt}deg`, '--roll': `${roll}deg` } as CSSProperties}
        onPointerLeave={(event) => {
          if (event.pointerType !== 'mouse') return
          wobbleTarget.current = { tilt: 0, roll: 0 }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onLostPointerCapture={onPointerUp}
      >
        <div className="spin-shutter__scene">
          <div ref={ringRef} className="spin-shutter__ring">
            {photos.map((photo, index) => (
              <button
                key={photo.src}
                type="button"
                ref={(node) => {
                  cardRefs.current[index] = node
                }}
                className="spin-shutter__card"
                aria-label={ui.zoom(photo.alt)}
                aria-controls={previewId}
                aria-expanded={expandedPhoto === photo}
                style={{ '--k': index } as CSSProperties}
                onClick={(event) => openPhoto(event, photo)}
                onFocus={(event) => {
                  if (event.currentTarget.matches(':focus-visible')) goTo(index, event.timeStamp)
                }}
              >
                <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" draggable={false} style={{ objectPosition: photo.position }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="spin-shutter__bar" inert={!!expandedPhoto}>
        <button type="button" className="spin-shutter__nav" aria-label={ui.prev} onClick={(event) => goBy(-1, event.timeStamp)}>
          <Icon name="chevronLeft" size={22} />
        </button>
        <button type="button" className="spin-shutter__nav" aria-label={ui.next} onClick={(event) => goBy(1, event.timeStamp)}>
          <Icon name="chevronRight" size={22} />
        </button>
      </div>

      <div
        ref={previewRef}
        id={previewId}
        className="spin-shutter__preview"
        role="region"
        aria-label={ui.expanded(expandedPhoto?.alt)}
        aria-hidden={!expandedPhoto}
        inert={!expandedPhoto}
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget || event.currentTarget.hasAttribute('data-expanded')) return
          if (event.propertyName === 'width' || event.propertyName === 'height') finishPhotoClose()
        }}
      >
        {expandedPhoto && (
          <img key={expandedPhoto.src} className="spin-shutter__expanded-image" src={expandedPhoto.src} alt={expandedPhoto.alt} />
        )}
        {/* Flechas del visor: solo existen con la foto abierta; se ven al pasar el cursor (en táctil, siempre). */}
        <button type="button" className="spin-shutter__step spin-shutter__step--prev" aria-label={ui.prev} onClick={() => stepPhoto(-1)}>
          <Icon name="chevronLeft" size={26} />
        </button>
        <button type="button" className="spin-shutter__step spin-shutter__step--next" aria-label={ui.next} onClick={() => stepPhoto(1)}>
          <Icon name="chevronRight" size={26} />
        </button>
        <button ref={closeRef} type="button" className="spin-shutter__close" aria-label={ui.close} onClick={closePhoto}>
          <Icon name="close" size={26} />
        </button>
      </div>
    </div>
  )
}
