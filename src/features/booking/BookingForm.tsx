import { InteractiveHoverContent } from '@/components/ui/AnimatedButtons'
// ─────────────────────────────────────────────────────────────────────────────
// FORMULARIO DE CITAS (compartido: homepage y las páginas de servicio, vía pages/home/sections/Schedule.tsx)
//
// Tres pasos agrupados: 1) Tus datos · 2) Tu cita (servicio, fecha, horario en lista y primera visita) · 3) Para terminar.
// • La lógica (lectura, validación y envío al Apps Script) está en features/booking/booking.ts y aquí abajo; el diseño es solo
//   de presentación. Los nombres de los campos y las reglas no cambian.
// • En páginas de servicio, `defaultService` preselecciona el servicio y adapta el texto de apoyo.
// • Estilos → src/styles/pages/home/schedule.css (contorno luminoso del icono: styles/components/siri.css).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { BOOKING, SERVICE_GROUPS, isBookingConfigured } from '@/config/booking'
import { useLang } from '@/app/lang'
import { routeOf } from '@/config/routes'
import { SITE } from '@/config/site'
import {
  addDays,
  formatDate,
  formatTime,
  isClosedDay,
  slotsFor,
  isFieldName,
  readForm,
  todayInClinic,
  validate,
  type FieldErrors,
  type FieldName,
} from '@/features/booking/booking'
import { FORM_TEXT, serviceLabel } from '@/features/booking/bookingText'
import { cx } from '@/lib/cx'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Picker } from '@/features/booking/Picker'

type ErrorCode = 'busy' | 'invalid' | 'limit' | 'network' | 'captcha'

interface Summary {
  name: string
  service: string
  date: string
  time: string
  /** Si dejó correo, el Apps Script le manda un comprobante. */
  emailed: boolean
}

/** Estado del envío: cada caso lleva solo los datos que necesita. */
type FormState =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'error'; code: ErrorCode }
  | { status: 'success'; summary: Summary }

/** Qué errores ofrecen el enlace a WhatsApp (el texto de cada uno, por idioma, está en bookingText.ts). */
// El Apps Script limita las solicitudes por teléfono (unas horas) y por hora en total.
const OFFER_WHATSAPP: Record<ErrorCode, boolean> = { busy: false, invalid: false, limit: true, network: true, captcha: true }

interface ServerReply {
  ok: boolean
  error?: string
  fields?: string[]
}

/** Tiempo máximo de espera de la respuesta del Apps Script. */
const SUBMIT_TIMEOUT_MS = 20_000

/** Caracteres que se quitan al escribir o pegar (teclado de celular, autocompletar y pegado incluidos). */
const NAME_CHARS = /[^\p{L} ]/gu
const PHONE_CHARS = /[^\d+]|(?!^)\+/g

const keepOnly = (junk: RegExp) => (event: FormEvent<HTMLInputElement>) => {
  const input = event.currentTarget
  const clean = input.value.replace(junk, '')
  if (clean !== input.value) input.value = clean
}

// Casilla anti-bots de Cloudflare Turnstile: solo se carga si hay llave pública (VITE_TURNSTILE_SITE_KEY).
interface TurnstileApi {
  render: (box: HTMLElement, options: Record<string, unknown>) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const turnstileApi = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile

let turnstileLoading: Promise<TurnstileApi> | undefined
const loadTurnstile = () =>
  (turnstileLoading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const ready = () => {
      const api = turnstileApi()
      if (api) resolve(api)
      else reject(new Error('turnstile'))
    }
    if (turnstileApi()) return ready()
    const script = document.createElement('script')
    script.src = TURNSTILE_SRC
    script.async = true
    script.onload = ready
    script.onerror = () => {
      turnstileLoading = undefined
      reject(new Error('turnstile'))
    }
    document.head.append(script)
  }))

// La fecha de hoy se lee solo en el navegador (en el HTML prerenderizado queda vacía).
const subscribe = () => () => {}
const getServerToday = () => ''

interface BookingFormProps {
  /** Servicio preseleccionado (páginas de servicio). Debe ser una opción de BOOKING.services. */
  defaultService?: string
}

export function BookingForm({ defaultService = '' }: BookingFormProps) {
  const lang = useLang()
  const t = FORM_TEXT[lang]
  const privacyPath = routeOf('privacy', lang).path
  const today = useSyncExternalStore(subscribe, todayInClinic, getServerToday)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [state, setState] = useState<FormState>({ status: 'idle' })
  // La fecha elegida decide qué horarios se ofrecen (los sábados hay menos).
  const [date, setDate] = useState('')
  const slots = slotsFor(date)
  const successRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Casilla anti-bots: el token solo sirve para un envío, así que se renueva después de cada intento.
  const captcha = useRef({ token: '', widgetId: '' })
  const captchaBoxRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const box = captchaBoxRef.current
    if (!BOOKING.turnstileSiteKey || !box) return
    let cancelled = false
    loadTurnstile()
      .then((api) => {
        if (cancelled) return
        captcha.current.widgetId = api.render(box, {
          sitekey: BOOKING.turnstileSiteKey,
          action: 'cita', // el Apps Script exige el mismo valor (CONFIG.TURNSTILE_ACTION)
          language: lang,
          callback: (token: string) => (captcha.current.token = token),
          'expired-callback': () => (captcha.current.token = ''),
          'error-callback': () => (captcha.current.token = ''),
        })
      })
      .catch(() => {}) // sin la casilla no se puede enviar: el envío avisa con el mensaje de verificación
    return () => {
      cancelled = true
      if (captcha.current.widgetId) turnstileApi()?.remove(captcha.current.widgetId)
      captcha.current = { token: '', widgetId: '' }
    }
  }, [lang])

  const fieldProps = (name: FieldName) => ({
    id: `cita-${name}`,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `cita-${name}-error` : undefined,
  })

  // Servicio y horario: botón propio (Picker); no dispara el change del formulario, por eso limpia su error al elegir.
  const pickerProps = (name: 'service' | 'time') => ({
    id: `cita-${name}`,
    name,
    invalid: Boolean(errors[name]),
    describedBy: errors[name] ? `cita-${name}-error` : undefined,
    onPick: () => clearError(name),
  })

  const clearError = (name: string) => {
    if (!isFieldName(name)) return
    setErrors((current) => {
      if (!(name in current)) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (state.status === 'sending') return
    const form = event.currentTarget
    const fields = readForm(new FormData(form))
    // La fecha de hoy se lee al enviar (no la del último render): evita validar contra "ayer" si la
    // pestaña quedó abierta pasada la medianoche.
    const found = validate(fields, todayInClinic(), lang)
    const firstInvalid = Object.keys(found)[0]
    // flushSync: el error (aria-invalid, aria-describedby y su texto) ya debe estar en el DOM cuando llega el foco,
    // si no el lector de pantalla anuncia el campo sin el error.
    flushSync(() => {
      setErrors(found)
      if (firstInvalid) setState({ status: 'idle' })
    })

    if (firstInvalid) {
      // Por id: servicio y horario son botones (Picker) y su valor va en un campo oculto.
      form.querySelector<HTMLElement>(`#cita-${firstInvalid}`)?.focus()
      return
    }

    // El orden de las claves es el que espera el Apps Script.
    const payload = {
      firstName: fields.firstName,
      lastName: fields.lastName,
      phone: fields.phone,
      email: fields.email,
      service: fields.service,
      date: fields.date,
      time: fields.time,
      firstVisit: fields.firstVisit === 'si',
      comments: fields.comments,
      consent: true,
      hp_x: fields.hp_x,
      turnstile: captcha.current.token,
      source: window.location.href,
    }

    const showSuccess = () => {
      setState({
        status: 'success',
        summary: { name: payload.firstName, service: payload.service, date: payload.date, time: payload.time, emailed: Boolean(payload.email) },
      })
      form.reset()
      setDate('')
      requestAnimationFrame(() => successRef.current?.focus())
    }

    // Trampa anti-spam: si el campo oculto viene lleno se finge éxito sin enviar nada.
    if (payload.hp_x) return showSuccess()
    // Sin Apps Script conectado no se envía nada: se avisa (con enlace a WhatsApp) en vez de mostrar una confirmación falsa.
    if (!isBookingConfigured) return setState({ status: 'error', code: 'network' })
    // Con la casilla activa, sin verificación no se envía nada.
    if (BOOKING.turnstileSiteKey && !payload.turnstile) return setState({ status: 'error', code: 'captcha' })

    setState({ status: 'sending' })
    // Si el servidor no responde a tiempo, se cancela y se ofrece reintentar o usar WhatsApp.
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS)
    try {
      // text/plain evita la verificación CORS previa, que Apps Script no admite.
      const response = await fetch(BOOKING.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      const reply = (await response.json()) as ServerReply
      if (reply.ok) return showSuccess()

      if (reply.error === 'invalid') {
        // Marca en el formulario los campos que rechazó el servidor.
        const serverErrors: FieldErrors = {}
        for (const name of reply.fields ?? []) if (isFieldName(name)) serverErrors[name] = t.validation.server
        setErrors(serverErrors)
      }
      const known = reply.error === 'busy' || reply.error === 'invalid' || reply.error === 'limit' || reply.error === 'captcha'
      setState({ status: 'error', code: known ? (reply.error as ErrorCode) : 'network' })
    } catch {
      setState({ status: 'error', code: 'network' })
    } finally {
      window.clearTimeout(timeout)
      captcha.current.token = ''
      if (captcha.current.widgetId) turnstileApi()?.reset(captcha.current.widgetId)
    }
  }

  if (state.status === 'success') {
    const { summary } = state
    const details: { icon: IconName; label: string; value: string }[] = [
      { icon: 'tooth', label: t.success.service, value: serviceLabel(summary.service, lang) },
      { icon: 'calendar', label: t.success.date, value: formatDate(summary.date, lang) },
      { icon: 'clock', label: t.success.time, value: formatTime(summary.time, lang) },
    ]
    return (
      <div ref={successRef} className="booking-success" role="status" tabIndex={-1}>
        <span className="booking-success__check" aria-hidden="true">
          <Icon name="check" size={34} />
        </span>
        <h3 className="booking-success__title">{t.success.title(summary.name)}</h3>
        <dl className="booking-ticket">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt>
                <span className="booking-ticket__icon" aria-hidden="true">
                  <Icon name={detail.icon} size={18} />
                </span>
                {detail.label}
              </dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
        <p className="booking-success__text">
          {t.success.text}
          {summary.emailed && ` ${t.success.emailSent}`}
        </p>
      </div>
    )
  }

  const minDate = today ? addDays(today, 1) : undefined
  const maxDate = today ? addDays(today, BOOKING.daysAhead) : undefined
  const sending = state.status === 'sending'
  const alert = state.status === 'error' ? { text: t.errors[state.code], offerWhatsApp: OFFER_WHATSAPP[state.code] } : null
  const lead = defaultService ? t.lead(serviceLabel(defaultService, lang)) : t.leadGeneric

  return (
    <form
      className="booking-form"
      noValidate
      onSubmit={onSubmit}
      onChange={(event) => {
        const target = event.nativeEvent.target as HTMLInputElement
        // La fecha vaciada por ser un día sin atención conserva su aviso (lo pone el propio campo de fecha).
        if (target.name === 'date' && !target.value) return
        clearError(target.name)
      }}
      aria-labelledby="cita-titulo"
    >
      <header className="booking-form__head">
        <span className="booking-form__badge siri" aria-hidden="true">
          <Icon name="calendar" size={24} />
        </span>
        <div>
          <p className="booking-form__eyebrow">{t.eyebrow}</p>
          <h3 ref={titleRef} id="cita-titulo" className="booking-form__title" tabIndex={-1}>
            {t.title}
          </h3>
          <p className="booking-form__lead">{lead}</p>
        </div>
      </header>
      <p className="booking-form__note">
        {t.requiredBefore}
        <span aria-hidden="true">*</span>
        <span className="visually-hidden">{t.requiredSr}</span>
        {t.requiredAfter}
      </p>

      <Group step={1} title={t.groups.data}>
        <div className="form-grid">
          <Field name="firstName" label={t.labels.firstName} icon="user" required error={errors.firstName}>
            <input {...fieldProps('firstName')} type="text" autoComplete="given-name" maxLength={50} required placeholder=" "
              onInput={keepOnly(NAME_CHARS)} />
          </Field>

          <Field name="lastName" label={t.labels.lastName} icon="user" required error={errors.lastName}>
            <input {...fieldProps('lastName')} type="text" autoComplete="family-name" maxLength={50} required placeholder=" "
              onInput={keepOnly(NAME_CHARS)} />
          </Field>
        </div>

        <div className="form-grid">
          <Field name="phone" label={t.labels.phone} icon="phone" required error={errors.phone}>
            <input {...fieldProps('phone')} type="tel" autoComplete="tel" inputMode="tel" maxLength={20} required placeholder=" "
              onInput={keepOnly(PHONE_CHARS)} />
          </Field>

          <Field name="email" label={t.labels.email} icon="mail" error={errors.email}>
            <input {...fieldProps('email')} type="email" autoComplete="email" maxLength={120} placeholder=" " />
          </Field>
        </div>
      </Group>

      <Group step={2} title={t.groups.appointment}>
        <Field name="service" label={t.labels.service} icon="tooth" required error={errors.service}>
          <Picker
            {...pickerProps('service')}
            placeholder={t.labels.servicePlaceholder}
            defaultValue={defaultService}
            groups={SERVICE_GROUPS.map((group) => ({
              label: t.labels.serviceGroups[group.id],
              icon: group.icon,
              // El valor enviado es el nombre en español (lo valida Code.gs); solo la etiqueta cambia con el idioma.
              options: group.services.map((service) => ({ value: service, label: serviceLabel(service, lang) })),
            }))}
          />
        </Field>

        <Field name="date" label={t.labels.date} required error={errors.date}>
          <input {...fieldProps('date')} type="date" min={minDate} max={maxDate ?? '2099-12-31'} required
            onChange={(event) => {
              const input = event.currentTarget
              // Día sin atención: se vacía el campo y se avisa al instante, en lugar de dejarlo elegido.
              if (isClosedDay(input.value)) {
                input.value = ''
                setDate('')
                setErrors((current) => ({ ...current, date: t.validation.closed }))
                return
              }
              // Un valor vacío es el eco de haberlo vaciado arriba: no debe borrar el aviso.
              if (input.value) clearError('date')
              setDate(input.value)
            }} />
        </Field>

        {/* Horario: cuadrícula Mañana/Tarde con los horarios de la fecha elegida (BOOKING.slots, recortados los sábados). La key la reinicia al cambiar la lista. */}
        <Field name="time" label={t.labels.time} icon="clock" required error={errors.time}>
          <Picker
            key={slots.length}
            {...pickerProps('time')}
            grid
            placeholder={t.labels.timePlaceholder}
            groups={[
              { label: t.labels.morning, slots: slots.filter((slot) => slot < '12:00') },
              { label: t.labels.afternoon, slots: slots.filter((slot) => slot >= '12:00') },
            ].map((group) => ({ label: group.label, options: group.slots.map((slot) => ({ value: slot, label: formatTime(slot, lang) })) }))}
          />
        </Field>

        <fieldset
          className={cx('field field--choice', errors.firstVisit && 'has-error')}
          aria-describedby={errors.firstVisit ? 'cita-firstVisit-error' : undefined}
        >
          <legend className="field__label">
            {t.labels.firstVisit} <span aria-hidden="true">*</span>
          </legend>
          <div className="choice-row">
            {[
              { value: 'si', label: t.labels.firstVisitYes },
              { value: 'no', label: t.labels.firstVisitNo },
            ].map((option, index) => (
              <label key={option.value} className="choice">
                <input
                  type="radio"
                  name="firstVisit"
                  value={option.value}
                  id={index === 0 ? 'cita-firstVisit' : undefined}
                  aria-invalid={errors.firstVisit ? true : undefined}
                  required
                />
                {option.label}
              </label>
            ))}
          </div>
          <FieldError name="firstVisit" error={errors.firstVisit} />
        </fieldset>
      </Group>

      <Group step={3} title={t.groups.finish}>
        <Field name="comments" label={t.labels.comments} hint={t.labels.commentsHint} error={errors.comments}>
          <textarea
            {...fieldProps('comments')}
            rows={3}
            maxLength={500}
            aria-describedby={errors.comments ? 'cita-comments-ayuda cita-comments-error' : 'cita-comments-ayuda'}
          />
        </Field>

        {/* Trampa anti-spam: oculta para personas; si se llena, la solicitud se descarta. */}
        <div className="hp-field" aria-hidden="true">
          <label>
            {t.labels.honeypot}
            <input type="text" name="hp_x" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {BOOKING.turnstileSiteKey && <div ref={captchaBoxRef} className="booking-form__captcha" />}

        <div className={cx('field field--consent', errors.consent && 'has-error')}>
          <label className="choice">
            <input {...fieldProps('consent')} type="checkbox" required />
            <span>
              {t.consent.before}
              <ExternalLink className="text-link" href={privacyPath}>
                {t.consent.link}
              </ExternalLink>
              {t.consent.after} <span aria-hidden="true">*</span>
            </span>
          </label>
          <FieldError name="consent" error={errors.consent} />
        </div>
      </Group>

      <div className="booking-form__footer">
        {/* aria-disabled (no disabled): el botón conserva el foco mientras se envía. */}
        <button type="submit" className="btn btn--primary btn--lg booking-form__submit interactive-hover" aria-disabled={sending}>
          <InteractiveHoverContent>{sending ? t.sending : t.submit}</InteractiveHoverContent>
        </button>
        <span role="status" className="visually-hidden">
          {sending ? t.sendingSr : ''}
        </span>
        <p className="booking-form__fine">
          <Icon name="shield" size={16} />
          {t.fine}
        </p>
      </div>

      <div className="booking-form__status" role="alert">
        {alert && (
          <p className="form-alert">
            {alert.text}{' '}
            {alert.offerWhatsApp && (
              <ExternalLink className="text-link" href={SITE.social.whatsapp}>
                {t.whatsapp}
              </ExternalLink>
            )}
          </p>
        )}
      </div>
    </form>
  )
}

/** Bloque numerado del formulario (Tus datos · Tu cita · Para terminar). */
function Group({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  const id = `cita-grupo-${step}`
  return (
    <div className="booking-group" role="group" aria-labelledby={id}>
      <h4 id={id} className="booking-group__title">
        <span className="booking-group__num" aria-hidden="true">
          {step}
        </span>
        {title}
      </h4>
      <div className="booking-group__body">{children}</div>
    </div>
  )
}

function FieldError({ name, error }: { name: string; error?: string }) {
  if (!error) return null
  return (
    <p id={`cita-${name}-error`} className="field__error">
      {error}
    </p>
  )
}

interface FieldProps {
  name: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  /** Icono a la izquierda del campo (opcional). */
  icon?: IconName
  children: ReactNode
}

function Field({ name, label, required, hint, error, icon, children }: FieldProps) {
  const optional = FORM_TEXT[useLang()].optional
  return (
    <div className={cx('field', error && 'has-error', icon && 'field--icon')}>
      <label className="field__label" htmlFor={`cita-${name}`}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : <span className="field__optional">{optional}</span>}
      </label>
      <div className="field__control">
        {icon && <Icon name={icon} size={18} className="field__icon" />}
        {children}
      </div>
      {hint && (
        <p id={`cita-${name}-ayuda`} className="field__hint">
          {hint}
        </p>
      )}
      <FieldError name={name} error={error} />
    </div>
  )
}
