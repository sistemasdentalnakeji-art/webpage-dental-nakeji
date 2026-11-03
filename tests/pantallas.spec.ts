import { expect, test, type Page } from '@playwright/test'

const PAGES = [
  '/en/',
  '/es/',
  '/en/services/',
  '/en/benefits/',
  '/en/promotions/',
  '/en/agreements/',
  '/en/insurance/',
  '/en/contact/',
  '/en/about/',
  '/en/faq/',
  '/en/privacy/',
  '/en/terms/',
  '/es/blog/',
  '/en/blog/',
  '/en/blog/dental-crowns/',
]

// La casilla anti-bots de Cloudflare se sustituye por una vacía: las pruebas no dependen de internet.
test.beforeEach(async ({ page }) => {
  await page.route('**/challenges.cloudflare.com/**', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: 'window.turnstile = { render() { return "w" }, reset() {}, remove() {} }' }),
  )
})

const slug =(path: string) => path.replace(/\//g, '_').replace(/^_|_$/g, '') || 'inicio'

test.describe('Pantallas principales', () => {
  for (const path of PAGES) {
    test(`${path} carga, sin errores y sin desborde horizontal`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(path)
      await expect(page.locator('h1').first()).toBeVisible()
      // No se espera a "red en reposo": la página de contacto carga iframes de Facebook e Instagram que nunca terminan.
      await page.evaluate(() => document.fonts.ready)

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(1)
      expect(errors).toEqual([])
      // Los fondos WebGL y los recuadros de redes cambian solos: se tapan para que la captura sea estable.
      await expect(page).toHaveScreenshot(`${slug(path)}.png`, { fullPage: true, mask: [page.locator('canvas, iframe')] })
    })
  }
})

test.describe('Inicio en español: héroe y sección del diente', () => {
  test('textos nuevos y hilo amarillo', async ({ page }) => {
    await page.goto('/es/')
    await expect(page.locator('h1')).toHaveText('Dentistas comprometidos por tu salud.')
    await expect(page.locator('.hero__note li')).toHaveText([
      'Dentistas certificados',
      'Aceptamos aseguranzas americanas',
      'Laboratorio propio',
    ])
    const story = page.locator('.story')
    await expect(story.locator('.story__item--left')).toContainText('Acompañando a nuestros pacientes con dedicación y calidez')
    await expect(story.locator('h2')).toContainText('Todas las especialidades dentales y laboratorio dental')
    await expect(story.locator('.story__item--right')).toContainText('Atención dental en Tijuana para pacientes de todo el mundo')
    // El hilo del diente sigue azul (el de .decor) y el subrayado de las frases resaltadas es amarillo (#ffc928).
    await expect(story.locator('.story__thread')).toHaveCSS('color', 'rgb(123, 195, 235)')
    await expect(story.locator('.story__accent').first()).toHaveCSS('background-image', /rgb\(255, 201, 40\)/)
  })
})

test.describe('Navegación', () => {
  // Menú de hamburguesa por debajo de 1080 px (BP.nav en src/config/breakpoints.ts): celular y tableta.
  const narrow = (page: Page) => (page.viewportSize()?.width ?? 0) < 1080
  const openMenu = async (page: Page) => {
    if (narrow(page)) await page.getByRole('button', { name: 'Menu' }).click()
  }

  test('un submenú del menú principal abre y lleva a otra página', async ({ page }) => {
    await page.goto('/en/')
    await openMenu(page)
    await page.getByRole('navigation', { name: 'Main' }).locator('.nav-button').first().click()
    await page.locator('.dropdown__link:visible').first().click()
    await expect(page).not.toHaveURL(/\/en\/$/)
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('el selector de idioma cambia a español', async ({ page }) => {
    await page.goto('/en/')
    await openMenu(page)
    await page.locator(narrow(page) ? 'a.lang-switch--menu' : 'a.lang-switch--bar').click()
    await expect(page).toHaveURL(/\/es\//)
  })

  test('el botón Agendar lleva hasta el formulario', async ({ page }) => {
    await page.goto('/en/')
    await openMenu(page)
    await page.locator(narrow(page) ? '.schedule-link--menu' : '.schedule-link--bar').click()
    await expect(page).toHaveURL(/#/)
    await expect(page.locator('#agendar')).toBeInViewport({ timeout: 10_000 })
  })
})
