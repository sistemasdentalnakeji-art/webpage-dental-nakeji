import { expect, test, type Page } from '@playwright/test'

const ENDPOINT = '**/script.google.com/macros/s/PRUEBA/exec'
const TURNSTILE = '**/challenges.cloudflare.com/turnstile/v0/api.js*'
const TOKEN = 'token-de-prueba'

interface TurnstileStub {
  __ts?: { callback: (token: string) => void }
}

// Próximo día hábil (lunes a sábado) en la zona de la clínica, como AAAA-MM-DD.
function nextOpenDay() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Tijuana' }).format(new Date()).split('-').map(Number)
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1))
  if (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

// Intercepta el Apps Script: cuenta los envíos y responde lo que se le pida.
async function mockScript(page: Page, reply: (body: Record<string, unknown>) => Record<string, unknown>) {
  const sent: Record<string, unknown>[] = []
  await page.route(ENDPOINT, async (route) => {
    const body = JSON.parse(route.request().postData() ?? '{}')
    sent.push(body)
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(reply(body)),
    })
  })
  return sent
}

// Sustituye la casilla de Cloudflare por una de mentira que se resuelve a mano con solveCaptcha().
async function stubTurnstile(page: Page) {
  await page.route(TURNSTILE, (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'window.turnstile = { render(box, options) { window.__ts = options; return "w1" }, reset() {}, remove() {} }',
    }),
  )
}

async function solveCaptcha(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as TurnstileStub).__ts))
  await page.evaluate((token) => (window as unknown as TurnstileStub).__ts?.callback(token), TOKEN)
}

/** Lista desplegable propia (Picker): abre con clic y elige la opción n. */
async function pick(page: Page, name: string, n: number) {
  await page.locator(`#cita-${name}`).click()
  await page.getByRole('option').nth(n).click()
  await expect(page.locator(`input[name="${name}"]`)).not.toHaveValue('')
}

async function fillForm(page: Page, phone = '6641234567') {
  await page.locator('#cita-firstName').fill('Ana')
  await page.locator('#cita-lastName').fill('Lopez')
  await page.locator('#cita-phone').fill(phone)
  await pick(page, 'service', 0)
  await page.locator('#cita-date').fill(nextOpenDay())
  await pick(page, 'time', 0)
  await page.locator('input[name="firstVisit"][value="no"]').check({ force: true })
  await page.locator('#cita-consent').check({ force: true })
}

const submit = (page: Page) => page.locator('button[type="submit"].booking-form__submit').click()

async function openForm(page: Page) {
  await stubTurnstile(page)
  await page.goto('/en/')
  await page.locator('#cita-firstName').scrollIntoViewIfNeeded()
}

test.describe('Formulario de citas', () => {
  test('envío normal muestra la confirmación y manda una sola solicitud', async ({ page }) => {
    const sent = await mockScript(page, () => ({ ok: true }))
    await openForm(page)
    await fillForm(page)
    await solveCaptcha(page)
    await submit(page)
    await expect(page.locator('.booking-success')).toBeVisible()
    expect(sent).toHaveLength(1)
    expect(sent[0]).toMatchObject({ firstName: 'Ana', phone: '6641234567', consent: true, turnstile: TOKEN })
  })

  test('sábado: la lista de horarios termina a las 4:00 PM; entre semana llega a las 5:30 PM', async ({ page }) => {
    await openForm(page)
    const times = async () => {
      await page.locator('#cita-time').click()
      const list = await page.getByRole('option').allTextContents()
      await page.keyboard.press('Escape')
      return list
    }
    const dateAt = (day: number) => {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Tijuana' }).format(new Date()).split('-').map(Number)
      const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1))
      while (date.getUTCDay() !== day) date.setUTCDate(date.getUTCDate() + 1)
      return date.toISOString().slice(0, 10)
    }
    await page.locator('#cita-date').fill(dateAt(6))
    expect((await times()).at(-1)).toBe('4:00 PM')
    await page.locator('#cita-date').fill(dateAt(2))
    expect((await times()).at(-1)).toBe('5:30 PM')
    expect((await times())[0]).toBe('8:00 AM')
  })

  test('horario: se abre hacia abajo y se elige con el teclado', async ({ page }) => {
    await openForm(page)
    await page.locator('#cita-date').fill(nextOpenDay())
    const button = page.locator('#cita-time')
    await button.focus()
    await page.keyboard.press('Enter')
    const list = page.getByRole('listbox')
    await expect(list).toBeFocused()
    expect((await list.boundingBox())!.y).toBeGreaterThan((await button.boundingBox())!.y)
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await expect(page.locator('input[name="time"]')).toHaveValue('08:30')
    await expect(button).toBeFocused()
    await expect(button).toHaveText('8:30 AM')
  })

  test('con correo, la confirmación avisa del comprobante', async ({ page }) => {
    await mockScript(page, () => ({ ok: true }))
    await openForm(page)
    await fillForm(page)
    await page.locator('#cita-email').fill('ana@example.com')
    await solveCaptcha(page)
    await submit(page)
    await expect(page.locator('.booking-success__text')).toContainText('We sent a receipt to your email.')
  })

  test('domingo: al elegirlo el campo se vacía y sale el aviso al instante', async ({ page }) => {
    await openForm(page)
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Tijuana' }).format(new Date()).split('-').map(Number)
    const sunday = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1))
    while (sunday.getUTCDay() !== 0) sunday.setUTCDate(sunday.getUTCDate() + 1)
    await page.locator('#cita-date').fill(sunday.toISOString().slice(0, 10))
    await expect(page.locator('#cita-date')).toHaveValue('')
    await expect(page.locator('#cita-date-error')).toBeVisible()
  })

  test('campos vacíos no se envían y se marcan los errores', async ({ page }) => {
    const sent = await mockScript(page, () => ({ ok: true }))
    await openForm(page)
    await submit(page)
    await expect(page.locator('.field__error').first()).toBeVisible()
    expect(sent).toHaveLength(0)
  })

  test('envíos repetidos del mismo teléfono: el segundo recibe el aviso de límite', async ({ page }) => {
    const seen = new Set<string>()
    const sent = await mockScript(page, (body) => {
      const phone = String(body.phone)
      if (seen.has(phone)) return { ok: false, error: 'limit' }
      seen.add(phone)
      return { ok: true }
    })
    await openForm(page)
    await fillForm(page)
    await solveCaptcha(page)
    await submit(page)
    await expect(page.locator('.booking-success')).toBeVisible()

    await page.goto('/en/')
    await page.locator('#cita-firstName').scrollIntoViewIfNeeded()
    await fillForm(page)
    await solveCaptcha(page)
    await submit(page)
    await expect(page.locator('.form-alert')).toBeVisible()
    await expect(page.locator('.booking-success')).toHaveCount(0)
    expect(sent).toHaveLength(2)
  })

  test('el servidor rechaza los datos: el formulario marca el campo', async ({ page }) => {
    await mockScript(page, () => ({ ok: false, error: 'invalid', fields: ['phone'] }))
    await openForm(page)
    await fillForm(page)
    await solveCaptcha(page)
    await submit(page)
    await expect(page.locator('#cita-phone-error')).toBeVisible()
  })

  test('bot: sin pasar la verificación no se envía nada al servidor', async ({ page }) => {
    const sent = await mockScript(page, () => ({ ok: true }))
    await openForm(page)
    await fillForm(page)
    await submit(page)
    await expect(page.locator('.form-alert')).toContainText('security check')
    await expect(page.locator('.booking-success')).toHaveCount(0)
    expect(sent).toHaveLength(0)
  })

  test('bot: con el campo trampa lleno no se envía nada al servidor', async ({ page }) => {
    const sent = await mockScript(page, () => ({ ok: true }))
    await openForm(page)
    await fillForm(page)
    await page.locator('input[name="hp_x"]').fill('http://spam.example', { force: true })
    await solveCaptcha(page)
    await submit(page)
    expect(sent).toHaveLength(0)
  })

  test('el servidor responde captcha: se muestra el aviso de verificación', async ({ page }) => {
    await mockScript(page, () => ({ ok: false, error: 'captcha' }))
    await openForm(page)
    await fillForm(page)
    await solveCaptcha(page)
    await submit(page)
    await expect(page.locator('.form-alert')).toContainText('security check')
  })

  test('comentarios con enlaces se rechazan en el formulario', async ({ page }) => {
    const sent = await mockScript(page, () => ({ ok: true }))
    await openForm(page)
    await fillForm(page)
    await page.locator('#cita-comments').fill('visita http://malo.example')
    await solveCaptcha(page)
    await submit(page)
    await expect(page.locator('#cita-comments-error')).toBeVisible()
    expect(sent).toHaveLength(0)
  })
})
