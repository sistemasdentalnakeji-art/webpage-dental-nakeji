import fs from 'node:fs'
import vm from 'node:vm'
import { expect, test } from '@playwright/test'

// Corre Code.gs en un entorno simulado de Google (calendario, caché, correo) para probar sus reglas sin desplegarlo.
test.skip(({ isMobile }) => isMobile, 'Prueba de servidor: basta con correrla una vez')

interface Options {
  secret?: string
  mailFails?: boolean
  /** Correos que aun puede mandar la cuenta hoy (MailApp.getRemainingDailyQuota). */
  quota?: number
  /** Eventos que ya existen en el calendario. */
  events?: { title: string; description?: string; start: Date; allDay?: boolean }[]
}

interface Reply {
  ok: boolean
  error?: string
  fields?: string[]
}

function nextOpenDay() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Tijuana' }).format(new Date()).split('-').map(Number)
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1))
  if (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

// Respuestas de Cloudflare según el token: bueno, emitido para otro sitio, emitido para otra acción, o falso.
const CLOUDFLARE: Record<string, object> = {
  'token-bueno': { success: true, hostname: 'nakejidental.com', action: 'cita' },
  'token-otro-sitio': { success: true, hostname: 'malo.example', action: 'cita' },
  'token-otra-accion': { success: true, hostname: 'nakejidental.com', action: 'otra' },
}

// Próxima fecha (mañana o después) que cae en ese día de la semana (0 = domingo … 6 = sábado), en la zona de la clínica.
function nextWeekday(day: number) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Tijuana' }).format(new Date()).split('-').map(Number)
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1))
  while (date.getUTCDay() !== day) date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

// Fecha y hora de una solicitud tal como las arma Code.gs (zona horaria del proceso).
function at(date: string, time: string) {
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = time.split(':').map(Number)
  return new Date(y, m - 1, d, h, min, 0)
}

function loadScript({ secret = 'secreto', mailFails = false, events = [], quota = 100 }: Options = {}) {
  const cache = new Map<string, string>()
  const fetches = { count: 0 }
  const created: { title: string; allDay: boolean }[] = []
  const mails: unknown[] = []
  const sandbox = {
    console,
    CalendarApp: {
      EventColor: { YELLOW: '5' },
      getDefaultCalendar: () => ({
        getEvents: () =>
          events.map((event) => ({
            isAllDayEvent: () => Boolean(event.allDay),
            getStartTime: () => event.start,
            getTitle: () => event.title,
            getDescription: () => event.description ?? '',
          })),
        createEvent: (title: string) => {
          created.push({ title, allDay: false })
          return { setColor: () => {} }
        },
        createAllDayEvent: (title: string) => created.push({ title, allDay: true }),
      }),
    },
    CacheService: { getScriptCache: () => ({ get: (key: string) => cache.get(key) ?? null, put: (key: string, value: string) => cache.set(key, value) }) },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (key: string) => (key === 'TURNSTILE_SECRET' ? (secret ?? null) : null) }) },
    UrlFetchApp: {
      fetch: (_url: string, options: { payload: { response: string } }) => {
        fetches.count++
        return { getContentText: () => JSON.stringify(CLOUDFLARE[options.payload.response] ?? { success: false }) }
      },
    },
    MailApp: {
      getRemainingDailyQuota: () => quota,
      sendEmail: (mail: unknown) => {
        if (mailFails) throw new Error('cuota agotada')
        mails.push(mail)
      },
    },
    Session: { getScriptTimeZone: () => 'America/Tijuana' },
    Utilities: {
      formatDate: (date: Date, timeZone: string, format: string) => {
        const parts = Object.fromEntries(
          new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })
            .formatToParts(date)
            .map((part) => [part.type, part.value]),
        )
        return format === 'yyyy-MM-dd' ? `${parts.year}-${parts.month}-${parts.day}` : `${parts.year}${parts.month}${parts.day}${parts.hour}`
      },
    },
    ContentService: { createTextOutput: (text: string) => ({ setMimeType: () => ({ text }) }), MimeType: { JSON: 'json' } },
  }
  vm.createContext(sandbox)
  vm.runInContext(fs.readFileSync('integrations/google-calendar/Code.gs', 'utf8'), sandbox)
  const doPost = (sandbox as unknown as { doPost: (event: unknown) => { text: string } }).doPost

  const send = (body: unknown, raw = false): Reply => {
    const contents = raw ? String(body) : JSON.stringify(body)
    return JSON.parse(doPost({ postData: { contents } }).text) as Reply
  }
  return { send, created, mails, fetches }
}

const request = (extra: Record<string, unknown> = {}) => ({
  firstName: 'Ana',
  lastName: 'Lopez',
  phone: '6641234567',
  email: '',
  service: 'Limpieza dental',
  date: nextOpenDay(),
  time: '10:00',
  firstVisit: true,
  comments: '',
  consent: true,
  turnstile: 'token-bueno',
  ...extra,
})

test.describe('Code.gs (Apps Script)', () => {
  test('una solicitud válida crea el evento y avisa por correo', () => {
    const { send, created, mails } = loadScript()
    expect(send(request())).toEqual({ ok: true })
    expect(created).toHaveLength(1)
    expect(mails).toHaveLength(1)
  })

  test('sin token o con token falso se rechaza; con token bueno pasa', () => {
    const { send, created } = loadScript()
    expect(send(request({ turnstile: '' }))).toMatchObject({ ok: false, error: 'captcha' })
    expect(send(request({ turnstile: 'token-malo' }))).toMatchObject({ ok: false, error: 'captcha' })
    expect(created).toHaveLength(0)
    expect(send(request({ turnstile: 'token-bueno' }))).toEqual({ ok: true })
    expect(created).toHaveLength(1)
  })

  test('sin TURNSTILE_SECRET configurado se rechaza todo (falla cerrado)', () => {
    const { send, created } = loadScript({ secret: '' })
    expect(send(request())).toMatchObject({ ok: false, error: 'captcha' })
    expect(created).toHaveLength(0)
  })

  test('un token válido emitido para otro sitio o para otra acción se rechaza', () => {
    const { send, created } = loadScript()
    expect(send(request({ turnstile: 'token-otro-sitio' }))).toMatchObject({ ok: false, error: 'captcha' })
    expect(send(request({ turnstile: 'token-otra-accion' }))).toMatchObject({ ok: false, error: 'captcha' })
    expect(created).toHaveLength(0)
  })

  test('campo trampa lleno: responde ok sin crear nada ni llamar a Cloudflare', () => {
    const { send, created, fetches } = loadScript()
    expect(send(request({ hp_x: 'http://spam.example' }))).toEqual({ ok: true })
    expect(created).toHaveLength(0)
    expect(fetches.count).toBe(0)
  })

  test('el tope de intentos por hora corta antes de llamar a Cloudflare', () => {
    const { send, fetches } = loadScript()
    for (let i = 0; i < 300; i++) send(request({ turnstile: 'token-malo' }))
    expect(fetches.count).toBe(300)
    expect(send(request({ turnstile: 'token-malo' }))).toMatchObject({ ok: false, error: 'limit' })
    expect(fetches.count).toBe(300)
  })

  test('un cuerpo demasiado grande se rechaza sin procesarlo', () => {
    const { send, fetches } = loadScript()
    expect(send(request({ comments: 'a'.repeat(10000) }))).toMatchObject({ ok: false, error: 'invalid' })
    expect(fetches.count).toBe(0)
  })

  test('el mismo teléfono escrito con y sin código de país cuenta como uno solo', () => {
    const { send } = loadScript()
    // Límite: 3 por teléfono por hora (MAX_REQUESTS_PER_PHONE_PER_HOUR); la cuarta, en otro formato, ya cuenta como el mismo número.
    expect(send(request({ phone: '6641234567', time: '10:00' }))).toEqual({ ok: true })
    expect(send(request({ phone: '+526641234567', time: '11:00' }))).toEqual({ ok: true })
    expect(send(request({ phone: '6641234567', time: '12:00' }))).toEqual({ ok: true })
    expect(send(request({ phone: '+526641234567', time: '13:00' }))).toMatchObject({ ok: false, error: 'limit' })
  })

  test('el límite global por hora corta a la solicitud 31', () => {
    const { send } = loadScript()
    for (let i = 0; i < 30; i++) expect(send(request({ phone: `66400000${String(i).padStart(2, '0')}` }))).toEqual({ ok: true })
    expect(send(request({ phone: '6649999999' }))).toMatchObject({ ok: false, error: 'limit' })
  })

  test('cada solicitud manda su correo a los dos destinatarios, con teléfono y origen', () => {
    const { send, created, mails } = loadScript()
    send(request({ phone: '6640000001', source: 'https://nakejidental.com/servicios/implantes' }))
    send(request({ phone: '6640000002' }))
    expect(created).toHaveLength(2)
    expect(mails).toHaveLength(2)
    const mail = mails[0] as { to: string; subject: string; htmlBody: string }
    expect(mail.to).toBe('nakejidentalclinic@gmail.com,citasnakeji@gmail.com')
    expect(mail.subject).toContain('Nuevo lead')
    expect(mail.htmlBody).toContain('6640000001')
    expect(mail.htmlBody).toContain('/servicios/implantes')
  })

  test('con correo, el paciente recibe su comprobante sin los datos internos', () => {
    const { send, mails } = loadScript()
    expect(send(request({ email: 'ana@example.com', comments: 'dolor de muela' }))).toEqual({ ok: true })
    expect(mails).toHaveLength(2)
    const mail = mails[1] as { to: string; replyTo: string; subject: string; htmlBody: string }
    expect(mail.to).toBe('ana@example.com')
    expect(mail.replyTo).toBe('citasnakeji@gmail.com')
    expect(mail.subject).toContain('Recibimos tu solicitud')
    expect(mail.htmlBody).toContain('Nuestro equipo se comunicará contigo para confirmar tu cita')
    expect(mail.htmlBody).toContain('📘 Facebook')
    expect(mail.htmlBody).toContain('aviso-de-privacidad')
    expect(mail.htmlBody).not.toContain('dolor de muela')
    expect(mail.htmlBody).not.toContain('6641234567')
  })

  test('sin cuota para los tres, solo sale el aviso a la clinica', () => {
    const { send, mails } = loadScript({ quota: 2 })
    expect(send(request({ email: 'ana@example.com' }))).toEqual({ ok: true })
    expect(mails).toHaveLength(1)
    expect((mails[0] as { to: string }).to).toContain('citasnakeji@gmail.com')
  })

  test('si el correo falla, la cita se crea y queda un aviso visible en el calendario', () => {
    const { send, created } = loadScript({ mailFails: true })
    expect(send(request())).toEqual({ ok: true })
    expect(created.some((event) => event.allDay && event.title.startsWith('AVISO'))).toBe(true)
  })

  test('cuerpos raros se rechazan sin romper nada', () => {
    const { send } = loadScript()
    expect(send('null', true)).toMatchObject({ ok: false, error: 'invalid' })
    expect(send('[]', true)).toMatchObject({ ok: false, error: 'invalid' })
    expect(send('no es json', true)).toMatchObject({ ok: false, error: 'server' })
  })

  test('una fecha con espacios de sobra se limpia y se acepta', () => {
    const { send } = loadScript()
    expect(send(request({ date: `${nextOpenDay()}      ` }))).toEqual({ ok: true })
  })

  test('cupo: 5 citas del mismo servicio a la misma hora; la sexta se rechaza', () => {
    const day = nextOpenDay()
    const filled = (count: number) =>
      Array.from({ length: count }, (_, i) => ({ title: `Solicitud de cita: Limpieza dental - Paciente ${i}`, start: at(day, '10:00') }))
    expect(loadScript({ events: filled(4) }).send(request({ date: day, time: '10:00' }))).toEqual({ ok: true })
    const full = loadScript({ events: filled(5) })
    expect(full.send(request({ date: day, time: '10:00' }))).toMatchObject({ ok: false, error: 'busy' })
    expect(full.created).toHaveLength(0)
  })

  test('cupo: otro servicio, otra hora o un evento de todo el día no cuentan', () => {
    const day = nextOpenDay()
    const five = (event: { title: string; start: Date; allDay?: boolean }) => Array.from({ length: 5 }, () => event)
    const sent = (events: ReturnType<typeof five>) => loadScript({ events }).send(request({ date: day, time: '10:00' }))
    expect(sent(five({ title: 'Solicitud de cita: Coronas - Ana', start: at(day, '10:00') }))).toEqual({ ok: true })
    expect(sent(five({ title: 'Solicitud de cita: Limpieza dental - Ana', start: at(day, '11:00') }))).toEqual({ ok: true })
    expect(sent(five({ title: 'Limpieza dental', start: at(day, '10:00'), allDay: true }))).toEqual({ ok: true })
  })

  test('cupo: una cita puesta a mano cuenta si el título dice el servicio', () => {
    const day = nextOpenDay()
    const events = Array.from({ length: 5 }, () => ({ title: 'limpieza dental - Sra. Perez', start: at(day, '10:00') }))
    expect(loadScript({ events }).send(request({ date: day, time: '10:00' }))).toMatchObject({ ok: false, error: 'busy' })
  })

  test('cupo: reconoce los títulos escritos a mano por recepción', () => {
    const day = nextOpenDay()
    const five = (title: string) => Array.from({ length: 5 }, (_, i) => ({ title: `${title} ${i}`, start: at(day, '10:00') }))
    const sent = (title: string, service: string) => loadScript({ events: five(title) }).send(request({ date: day, time: '10:00', service }))
    expect(sent('Px Alejandro Torres consulta para Implantes', 'Implantes dentales')).toMatchObject({ error: 'busy' })
    expect(sent('Px Roland Baldwin 1a vez Deep Cleaning', 'Limpieza dental')).toMatchObject({ error: 'busy' })
    expect(sent('PX HERWIN ACOSTA appo to evaluate', 'Valoración general')).toMatchObject({ error: 'busy' })
    // "All on 4 implants" no cuenta como "Implantes dentales", ni al revés.
    expect(sent('Px Ana All on 4 implants', 'Implantes dentales')).toEqual({ ok: true })
    expect(sent('Px Ana consulta para Implantes', 'All on 4 implants')).toEqual({ ok: true })
  })

  test('domingo no se puede agendar', () => {
    const { send, created } = loadScript()
    expect(send(request({ date: nextWeekday(0) }))).toMatchObject({ ok: false, error: 'invalid', fields: ['date'] })
    expect(created).toHaveLength(0)
  })

  test('sábado: se acepta hasta las 16:00 y después no', () => {
    const { send, created } = loadScript()
    expect(send(request({ date: nextWeekday(6), time: '16:30', phone: '6640000001' }))).toMatchObject({ ok: false, error: 'invalid', fields: ['time'] })
    expect(send(request({ date: nextWeekday(6), time: '17:30', phone: '6640000001' }))).toMatchObject({ ok: false, error: 'invalid', fields: ['time'] })
    expect(created).toHaveLength(0)
    expect(send(request({ date: nextWeekday(6), time: '16:00', phone: '6640000001' }))).toEqual({ ok: true })
    expect(created).toHaveLength(1)
  })

  test('entre semana se acepta hasta las 17:30', () => {
    const { send } = loadScript()
    expect(send(request({ date: nextWeekday(2), time: '17:30' }))).toEqual({ ok: true })
  })

  test('comentarios con enlaces se rechazan', () => {
    const { send } = loadScript()
    expect(send(request({ comments: 'entra a www.malo.example' }))).toMatchObject({ ok: false, error: 'invalid', fields: ['comments'] })
  })
})
