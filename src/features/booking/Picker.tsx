// Lista desplegable propia del formulario de citas (servicio y horario): abre siempre hacia abajo, agrupa las opciones
// y envía el valor con un <input type="hidden"> (el formulario la lee igual que a un <select>).
// Patrón ARIA "select-only combobox": botón con role="combobox" + role="listbox"; teclado: flechas, Inicio/Fin, Enter, Esc.

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cx } from '@/lib/cx'
import './picker.css'

export interface PickerGroup {
  label: string
  icon?: IconName
  options: { value: string; label: string }[]
}

interface PickerProps {
  /** id del botón (lo usan la etiqueta del campo y el foco al validar). */
  id: string
  name: string
  placeholder: string
  groups: PickerGroup[]
  defaultValue?: string
  /** Cuadrícula de botones (horarios) en vez de lista. */
  grid?: boolean
  invalid?: boolean
  describedBy?: string
  onPick?: (value: string) => void
}

export function Picker({ id, name, placeholder, groups, defaultValue = '', grid, invalid, describedBy, onPick }: PickerProps) {
  const listId = useId()
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const options = groups.flatMap((group) => group.options)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const optionId = (index: number) => `${listId}-${index}`
  const selected = options.find((option) => option.value === value)

  // Clic o toque fuera: se cierra.
  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  // Al abrir, el foco pasa a la lista y la página se desplaza lo justo para que se vea completa.
  useEffect(() => {
    if (!open) return
    listRef.current?.focus({ preventScroll: true })
    listRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [open])

  useEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' })
  })

  const show = () => {
    setActive(Math.max(0, options.findIndex((option) => option.value === value)))
    setOpen(true)
  }

  const pick = (index: number) => {
    const option = options[index]
    if (!option) return
    setValue(option.value)
    setOpen(false)
    buttonRef.current?.focus()
    onPick?.(option.value)
  }

  const onButtonKey = (event: KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      show()
    }
  }

  const onListKey = (event: KeyboardEvent) => {
    const last = options.length - 1
    const step = grid ? 1 : 0
    const moves: Record<string, number> = {
      ArrowDown: grid ? 3 : 1,
      ArrowUp: grid ? -3 : -1,
      ArrowRight: step,
      ArrowLeft: -step,
    }
    if (event.key in moves) {
      event.preventDefault()
      setActive((index) => Math.min(last, Math.max(0, index + moves[event.key])))
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setActive(event.key === 'Home' ? 0 : last)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      pick(active)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
    } else if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  let index = -1
  return (
    <div ref={rootRef} className={cx('picker', open && 'is-open')}>
      <input type="hidden" name={name} value={value} />
      <button
        ref={buttonRef}
        id={id}
        type="button"
        className={cx('picker__trigger', !selected && 'is-empty')}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onButtonKey}
      >
        {selected?.label ?? placeholder}
      </button>
      {open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={id}
          aria-activedescendant={optionId(active)}
          tabIndex={-1}
          className={cx('picker__list', grid && 'picker__list--grid')}
          onKeyDown={onListKey}
        >
          {groups.map((group) => (
            <div key={group.label} role="group" aria-label={group.label} className="picker__group">
              <p className="picker__group-title" aria-hidden="true">
                {group.icon && <Icon name={group.icon} size={16} />}
                {group.label}
              </p>
              <div className="picker__options">
                {group.options.map((option) => {
                  const i = ++index
                  return (
                    <div
                      key={option.value}
                      id={optionId(i)}
                      role="option"
                      aria-selected={option.value === value}
                      className={cx('picker__option', i === active && 'is-active')}
                      onPointerEnter={() => setActive(i)}
                      onClick={() => pick(i)}
                    >
                      {option.label}
                      {option.value === value && <Icon name="check" size={16} className="picker__check" />}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
