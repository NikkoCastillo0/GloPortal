import { test, expect } from '@playwright/test'

const labels = ['Privacy Policy', 'Terms of Service', 'Cancellation Policy']

test.beforeEach(async ({ page }) => {
  const errors = []
  const externalRequests = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('**/*', route => {
    if (new URL(route.request().url()).origin === 'http://127.0.0.1:4186') return route.continue()
    externalRequests.push(route.request().url())
    return route.abort()
  })
  page.footerChecks = { errors, externalRequests }
})

test.afterEach(async ({ page }) => {
  expect(page.footerChecks.errors).toEqual([])
  expect(page.footerChecks.externalRequests).toEqual([])
})

test('branding, current copyright year, and unavailable policies render without broken links', async ({ page }) => {
  await page.goto('/__gp266/footer')
  const footer = page.getByRole('contentinfo')
  await expect(footer).toHaveCount(1)
  await expect(footer.getByRole('link', { name: 'Garage Glo home' })).toHaveAttribute('href', '/')
  await expect(footer.getByText('Tire service in Salinas, California.')).toBeVisible()
  const year = await page.evaluate(() => new Date().getFullYear())
  await expect(footer).toContainText('© ' + year + ' Garage Glo. All rights reserved.')
  const policies = footer.getByRole('navigation', { name: 'Policies' })
  await expect(policies.getByRole('link')).toHaveCount(0)
  await expect(policies.locator('[aria-disabled=true]')).toHaveCount(3)
  await expect(policies.getByText('Coming soon', { exact: true })).toHaveCount(3)
  for (const label of labels) await expect(policies.getByText(label, { exact: true })).toBeVisible()
  await expect(footer.locator('a[href="#"], a[href=""], button')).toHaveCount(0)
})

test('configured policy destinations work with keyboard navigation and visible focus', async ({ page }) => {
  await page.goto('/__gp266/footer?links=all')
  const footer = page.getByRole('contentinfo')
  await footer.getByRole('link', { name: 'Garage Glo home' }).focus()
  for (const [index, id] of ['privacy', 'terms', 'cancellation'].entries()) {
    const link = footer.getByRole('link', { name: labels[index], exact: true })
    await expect(link).toHaveAttribute('href', '/__gp266/destination/' + id)
    await page.keyboard.press('Tab')
    await expect(link).toBeFocused()
    await expect(link).toHaveCSS('outline-style', 'solid')
    await expect(link).toHaveCSS('outline-width', '2px')
    expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44)
  }
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/__gp266\/destination\/cancellation$/)
  await expect(page.getByRole('heading', { name: 'Configured test destination' })).toBeVisible()
})

test('each destination can be enabled independently', async ({ page }) => {
  await page.goto('/__gp266/footer?links=partial')
  const policies = page.getByRole('navigation', { name: 'Policies' })
  await expect(policies.getByRole('link')).toHaveCount(1)
  await expect(policies.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/__gp266/destination/privacy')
  await expect(policies.locator('[aria-disabled=true]')).toHaveCount(2)
})

test('footer stacks on mobile, fits every viewport, and stays after page content', async ({ page }, testInfo) => {
  await page.goto('/__gp266/footer')
  await page.evaluate(() => document.fonts.ready)
  const footer = page.getByRole('contentinfo')
  await expect(footer).toHaveCSS('background-color', 'rgb(50, 50, 50)')
  const box = await footer.boundingBox()
  const main = await page.getByRole('main').boundingBox()
  const brand = await footer.getByRole('link', { name: 'Garage Glo home' }).boundingBox()
  const policies = await footer.getByRole('navigation', { name: 'Policies' }).boundingBox()
  const viewport = page.viewportSize()
  expect(box.x).toBe(0)
  expect(box.width).toBe(viewport.width)
  expect(box.y).toBeGreaterThanOrEqual(main.y + main.height)
  expect(box.y + box.height).toBeGreaterThanOrEqual(viewport.height)
  if (viewport.width < 768) expect(policies.y).toBeGreaterThan(brand.y + brand.height)
  else expect(policies.x).toBeGreaterThan(brand.x + brand.width)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  for (const item of await footer.locator('li').all()) {
    const itemBox = await item.boundingBox()
    expect(itemBox.x).toBeGreaterThanOrEqual(0)
    expect(itemBox.x + itemBox.width).toBeLessThanOrEqual(viewport.width)
  }
  await footer.screenshot({ path: testInfo.outputPath('footer.png') })
})

test('the real application renders exactly one footer on all eight existing routes', async ({ page }) => {
  const routes = [
    ['/', 'Garage Glo', 'customer'],
    ['/login', 'Log In', 'customer'],
    ['/signup', 'Sign Up', 'customer'],
    ['/customerportal', 'Customer Dashboard', 'customer'],
    ['/adminportal', 'This is the Admin Portal !', 'admin'],
    ['/viewappointments', 'All Appointments', 'admin'],
    ['/editappointment', 'Edit Appointment', 'admin'],
    ['/monthlybooking', 'Monthly Booking', 'customer'],
  ]
  for (const [path, heading, role] of routes) {
    await page.goto(path + '?role=' + role)
    await expect(page.getByRole('contentinfo')).toHaveCount(1)
    if (path !== '/') await expect(page.getByRole('heading', { name: heading, exact: true })).toBeAttached()
    await expect(page.getByRole('contentinfo').getByRole('navigation', { name: 'Policies' }).getByRole('link')).toHaveCount(0)
    await expect(page.getByText('This is the Footer!', { exact: true })).toHaveCount(0)
  }
})

test('footer remains singular during client-side navigation and its home link works', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: 'Sign up', exact: true }).click()
  await expect(page).toHaveURL(/\/signup$/)
  await expect(page.getByRole('contentinfo')).toHaveCount(1)
  await page.getByRole('contentinfo').getByRole('link', { name: 'Garage Glo home' }).click()
  await expect(page).toHaveURL('http://127.0.0.1:4186/')
  await expect(page.getByRole('contentinfo')).toHaveCount(1)
})

test('footer remains available during existing loading and access-denied states', async ({ page }) => {
  await page.goto('/viewappointments?access=loading')
  await expect(page.getByText('Verifying administrator access...')).toBeVisible()
  await expect(page.getByRole('contentinfo')).toHaveCount(1)
  await page.goto('/viewappointments?access=denied')
  await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible()
  await expect(page.getByRole('contentinfo')).toHaveCount(1)
  await page.goto('/editappointment?access=denied')
  await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible()
  await expect(page.getByRole('contentinfo')).toHaveCount(1)
})

test('footer stays below long content without covering the contact form', async ({ page }) => {
  await page.goto('/')
  const footer = page.getByRole('contentinfo')
  await footer.scrollIntoViewIfNeeded()
  const box = await footer.boundingBox()
  const contact = await page.locator('#contact').boundingBox()
  expect(box.y).toBeGreaterThanOrEqual(contact.y + contact.height)
  await expect(footer).toHaveCSS('position', 'static')
  expect(await footer.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
})
