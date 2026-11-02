import { useEffect, useId, useRef, type ReactNode } from 'react'
import type { ShaderMount } from '@paper-design/shaders'
import { Icon } from './Icon'
import { motionOff } from '@/lib/motion'

// Adaptado de dillionverma/interactive-hover-button (21st.dev).
// `bell`: una campanita que se mece cada 5 s sustituye al punto dorado en reposo (el relleno dorado al pasar el cursor sigue igual).
export function InteractiveHoverContent({ children, bell }: { children: ReactNode; bell?: boolean }) {
  return <>
    <span className="interactive-hover__dot" aria-hidden="true" />
    {bell && <span className="interactive-hover__bell" aria-hidden="true"><Icon name="bell" size={18} /></span>}
    <span className="interactive-hover__label">{children}</span>
    <span className="interactive-hover__over" aria-hidden="true">{children}<Icon name="arrowRight" size={18} /></span>
  </>
}

// Adaptado de designali-in/liquid-glass-button; el filtro solo afecta al fondo.
export function LiquidGlassContent({ children }: { children: ReactNode }) {
  const id = useId()
  return <>
    <span className="liquid-glass__lens" aria-hidden="true" style={{ backdropFilter: `url("#${id}") blur(2px) saturate(1.6)` }} />
    <span className="liquid-glass__content">{children}</span>
    <svg width="0" height="0" className="liquid-glass__filter" aria-hidden="true">
      <defs><filter id={id} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        {/* Ruido de baja frecuencia y desplazamiento corto: la refracción ondula suave (como líquido) en vez de granularse. */}
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="3" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="3" result="blur" />
        <feDisplacementMap in="SourceGraphic" in2="blur" scale="9" xChannelSelector="R" yChannelSelector="B" />
        <feGaussianBlur stdDeviation="1" />
      </filter></defs>
    </svg>
  </>
}

// johuniq / Joly UI: variante icon, con el mismo shader y sin animación en reposo.
export function LiquidMetalArrow() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const surface = ref.current!
    const target = surface.closest('.catalog-card, a')!
    let mount: ShaderMount | undefined
    let generation = 0
    let hovered = false
    let focused = false
    const stop = () => {
      generation++
      mount?.dispose()
      mount = undefined
    }
    const update = async () => {
      stop()
      if (motionOff() || !(hovered || focused)) return
      const token = generation
      try {
        const { ShaderMount, liquidMetalFragmentShader } = await import('@paper-design/shaders')
        if (token !== generation) return
        mount = new ShaderMount(surface, liquidMetalFragmentShader, {
          u_repetition: 4, u_softness: 0.5, u_shiftRed: 0.05, u_shiftBlue: 0.05,
          u_distortion: 0, u_contour: 0, u_angle: 45, u_scale: 8, u_shape: 1,
          u_offsetX: 0.1, u_offsetY: -0.1, u_originX: 0.5, u_originY: 0.5,
          u_worldWidth: 0, u_worldHeight: 0, u_fit: 2, u_rotation: 0,
          u_colorBack: [0, 0, 0, 0], u_colorTint: [0.18, 0.39, 0.68, 1], u_isImage: false,
        }, undefined, 0.35, 0, 1, 16384)
      } catch {
        // El acabado CSS permanece disponible si WebGL no está disponible.
        stop()
      }
    }
    const enter = () => { hovered = true; void update() }
    const leave = () => { hovered = false; void update() }
    const focus = () => { focused = true; void update() }
    const blur = () => { focused = false; void update() }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    target.addEventListener('pointerenter', enter)
    target.addEventListener('pointerleave', leave)
    target.addEventListener('pointercancel', leave)
    target.addEventListener('focusin', focus)
    target.addEventListener('focusout', blur)
    query.addEventListener('change', update)
    window.addEventListener('motionchange', update)
    return () => {
      stop()
      target.removeEventListener('pointerenter', enter)
      target.removeEventListener('pointerleave', leave)
      target.removeEventListener('pointercancel', leave)
      target.removeEventListener('focusin', focus)
      target.removeEventListener('focusout', blur)
      query.removeEventListener('change', update)
      window.removeEventListener('motionchange', update)
    }
  }, [])
  return <><span ref={ref} className="liquid-metal__surface" aria-hidden="true" /><Icon name="arrowRight" size={20} /></>
}
