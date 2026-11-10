import { test, expect } from '@playwright/test'

async function openActivity(page, scenario = 'mixed') {
  await page.goto('/customerportal?activity=' + scenario)
  await expect(page.getByRole('heading', { name: 'Customer Dashboard', exact: true })).toBeVisible()
  return page.getByRole('region', { name: 'Recent Activity', exact: true })
}

test.beforeEach(async ({ page }) => {
  const errors = []
  const externalRequests = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('**/*', route => {
    if (new URL(route.request().url()).origin === 'http://127.0.0.1:4193') return route.continue()
    externalRequests.push(route.request().url())
    return route.abort()
  })
  page.activityChecks = { errors, externalRequests }
})

test.afterEach(async ({ page }) => {
  expect(page.activityChecks.errors).toEqual([])
  expect(page.activityChecks.externalRequests).toEqual([])
})

test('mixed activities retain descriptions, dates, vehicle information, and list semantics', async ({ page }) => {
  const card = await openActivity(page)
  const list = card.getByRole('list', { name: 'Recent activity history' })
  const items = list.getByRole('listitem')
  await expect(items).toHaveCount(2)
  await expect(items.nth(0)).toContainText('Appointment Scheduled: Tire Patch - Oct 10, 2026')
  await expect(items.nth(0).getByText('2026-10-01', { exact: true })).toBeVisible()
  await expect(items.nth(1)).toContainText('Vehicle Added: 2022 Toyota Camry')
  await expect(items.nth(1).getByText('2026-09-22', { exact: true })).toBeVisible()
  await expect(card.getByText('No recent activity to show.', { exact: true })).toHaveCount(0)
})

test('appointment-only data renders its complete description and date', async ({ page }) => {
  const card = await openActivity(page, 'appointments')
  await expect(card.getByRole('listitem')).toHaveCount(1)
  await expect(card).toContainText('Appointment Scheduled: Tire Patch - Oct 10, 2026')
  await expect(card).toContainText('2026-10-01')
  await expect(card.getByText(/Vehicle Added:/)).toHaveCount(0)
})

test('vehicle-only data renders vehicle details and the addition date', async ({ page }) => {
  const card = await openActivity(page, 'vehicles')
  await expect(card.getByRole('listitem')).toHaveCount(1)
  await expect(card).toContainText('Vehicle Added: 2022 Toyota Camry')
  await expect(card).toContainText('2026-09-22')
  await expect(card.getByText(/Appointment Scheduled:/)).toHaveCount(0)
})

test('empty, omitted, and null activity data show the existing empty-state message', async ({ page }) => {
  for (const scenario of ['empty', 'missing', 'null']) {
    const card = await openActivity(page, scenario)
    await expect(card.getByText('No recent activity to show.', { exact: true })).toBeVisible()
    await expect(card.getByRole('list')).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Next Appointment', exact: true })).toContainText('Tire Patch')
    await expect(page.getByRole('region', { name: 'My Vehicles', exact: true })).toContainText('2022 Toyota Camry')
  }
})

test('timestamps remain optional without losing activity descriptions', async ({ page }) => {
  let card = await openActivity(page, 'no-timestamps')
  await expect(card.getByRole('listitem')).toHaveCount(2)
  for (const item of await card.getByRole('listitem').all()) {
    await expect(item.locator('p')).toHaveCount(1)
  }
  await expect(card).toContainText('Appointment Scheduled: Tire Patch - Oct 10, 2026')
  await expect(card).toContainText('Vehicle Added: 2022 Toyota Camry')
  card = await openActivity(page, 'partial-timestamps')
  await expect(card.getByRole('listitem').nth(0).locator('p')).toHaveCount(2)
  await expect(card.getByRole('listitem').nth(0)).toContainText('2026-10-01')
  await expect(card.getByRole('listitem').nth(1).locator('p')).toHaveCount(1)
})

test('long descriptions, identifiers, and timestamps wrap without clipping or horizontal overflow', async ({ page }, testInfo) => {
  const card = await openActivity(page, 'long')
  await page.evaluate(() => document.fonts.ready)
  await expect(card.getByRole('listitem')).toHaveCount(2)
  await expect(card).toContainText('Tire mounting and balancing')
  await expect(card).toContainText('VIN: 1HGCM82633A004352')
  await expect(card.getByText('2026-10-01T14:30:00.000Z', { exact: true })).toBeVisible()
  for (const element of await card.locator('ul, li, li > p').all()) {
    expect(await element.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  }
  expect(await card.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await card.screenshot({ path: testInfo.outputPath('recent-activity-long.png') })
})

test('the existing card appearance and responsive dashboard layout are preserved', async ({ page }, testInfo) => {
  const card = await openActivity(page)
  await page.evaluate(() => document.fonts.ready)
  const heading = card.getByRole('heading', { name: 'Recent Activity', exact: true })
  await expect(heading).toHaveCSS('font-size', '24px')
  await expect(heading).toHaveCSS('color', 'rgb(255, 255, 255)')
  await expect(heading.locator('..')).toHaveCSS('background-color', 'rgb(50, 50, 50)')
  let previousBox
  for (const item of await card.getByRole('listitem').all()) {
    await expect(item).toHaveCSS('padding', '24px')
    await expect(item).toHaveCSS('border-radius', '10px')
    await expect(item.locator('p').first()).toHaveCSS('font-size', '20px')
    await expect(item.locator('p').first()).toHaveCSS('font-weight', '800')
    await expect(item.locator('p').last()).toHaveCSS('font-size', '16px')
    const box = await item.boundingBox()
    if (previousBox) expect(box.y - previousBox.y - previousBox.height).toBe(16)
    previousBox = box
  }
  const actionsBox = await page.getByRole('region', { name: 'Quick Actions', exact: true }).boundingBox()
  const cardBox = await card.boundingBox()
  if (page.viewportSize().width < 768) expect(cardBox.y).toBeGreaterThanOrEqual(actionsBox.y + actionsBox.height)
  else expect(cardBox.x).toBeGreaterThan(actionsBox.x + actionsBox.width)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await card.screenshot({ path: testInfo.outputPath('recent-activity.png') })
})

test('unchanged dashboard access checks handle loading, signed-out, denied, and admin states', async ({ page }) => {
  await page.goto('/customerportal?access=loading')
  await expect(page.getByText('Verifying account access...', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Recent Activity', exact: true })).toHaveCount(0)
  await page.goto('/customerportal?access=signed-out')
  await expect(page).toHaveURL('http://127.0.0.1:4193/login')
  await page.goto('/customerportal?access=denied')
  await expect(page.getByRole('heading', { name: 'Access Denied', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Recent Activity', exact: true })).toHaveCount(0)
  await page.goto('/customerportal?role=admin')
  await expect(page).toHaveURL('http://127.0.0.1:4193/adminportal')
  await openActivity(page)
  for (const name of ['Next Appointment', 'My Vehicles', 'Quick Actions', 'Recent Activity']) {
    await expect(page.getByRole('region', { name, exact: true })).toBeVisible()
  }
})
