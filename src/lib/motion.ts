// "Reducir movimiento" del sistema o "Pausar animaciones" del footer (html[data-motion='paused']).
// Solo se llama desde efectos y eventos (nunca durante el render: en Node no hay window).
let reduceQuery: MediaQueryList | undefined
export const motionOff = () =>
  (reduceQuery ??= window.matchMedia('(prefers-reduced-motion: reduce)')).matches ||
  document.documentElement.dataset.motion === 'paused'

// Pausa/reanuda todo el movimiento: lo usan el botón del footer (MotionToggle) y el flotante (FloatingContact).
export function setMotionPaused(paused: boolean) {
  const root = document.documentElement
  if (paused) root.dataset.motion = 'paused'
  else delete root.dataset.motion
  window.dispatchEvent(new Event('motionchange'))
}

// Contornos luminosos (.siri) y texto con brillo (.shiny-text): sus animaciones repintan en cada cuadro aunque estén lejos
// de la vista. Un solo observador les pone data-offscreen fuera de pantalla y el CSS (preferences.css) las pausa.
// Las demás animaciones infinitas (marquesinas, reseñas, plano…) reciben data-offscreen-loop. Los boletos de /beneficios/ se
// excluyen: su animación no cambia.
// Se vuelve a revisar cuando cambia el DOM (páginas diferidas, secciones que aparecen después) o empieza una animación nueva
// (por una clase que se agrega), así que también se pausan las que no existían al cargar.
export function pauseOffscreen() {
  const seen = new WeakSet<Element>()
  const glow = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting)
  })
  const loops = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.target.toggleAttribute('data-offscreen-loop', !entry.isIntersecting)
  })
  const watch = (observer: IntersectionObserver, el: Element) => {
    if (seen.has(el)) return
    seen.add(el)
    observer.observe(el)
  }

  const scan = () => {
    for (const el of document.querySelectorAll('.siri, .shiny-text')) watch(glow, el)
    for (const animation of document.getAnimations()) {
      const effect = animation.effect as KeyframeEffect | null
      const target = effect?.target
      if (
        target &&
        animation.timeline === document.timeline &&
        effect.getTiming().iterations === Infinity &&
        !target.closest('.siri, .shiny-text, .benefit-grid, .benefits-cta')
      )
        watch(loops, target)
    }
  }

  // Varios cambios seguidos se revisan una sola vez, en el siguiente cuadro.
  let queued = false
  const later = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      queued = false
      scan()
    })
  }
  scan()
  new MutationObserver(later).observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true })
  document.addEventListener('animationstart', later)
}
