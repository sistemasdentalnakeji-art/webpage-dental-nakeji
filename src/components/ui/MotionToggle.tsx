// Botón "Pausar animaciones" (criterio WCAG 2.2.2: el movimiento que dura más de 5 s debe poder pausarse).
// Marca <html data-motion="paused"> (pausa las animaciones CSS, ver styles/global/preferences.css) y avisa
// con el evento `motionchange` a las animaciones SVG (SectionDecor) y al WebGL (AuroraBackground).

import { useEffect, useState } from 'react'
import { useLang } from '@/app/lang'
import { UI } from '@/data/ui'
import { setMotionPaused } from '@/lib/motion'

export function MotionToggle() {
  const [paused, setPaused] = useState(false)
  const ui = UI[useLang()]

  // Si otro control (el botón flotante) pausa o reanuda, este también lo refleja.
  useEffect(() => {
    const sync = () => setPaused(document.documentElement.dataset.motion === 'paused')
    window.addEventListener('motionchange', sync)
    return () => window.removeEventListener('motionchange', sync)
  }, [])

  const toggle = () => {
    const next = !paused
    setPaused(next)
    setMotionPaused(next)
  }

  return (
    <button type="button" className="motion-toggle" aria-pressed={paused} onClick={toggle}>
      {ui.pauseAnimations}
    </button>
  )
}
