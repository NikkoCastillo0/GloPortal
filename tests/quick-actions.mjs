import { test, expect } from '@playwright/test'
import { customerQuickActions } from '../src/config/customerQuickActions.js'

async function openDashboard(page) {
  await page.goto('/customerportal')
  await expect(page.getByRole('heading', { name: 'Customer Dashboard', exact: true })).toBeVisible()
  return page.getByRole('region', { name: 'Quick Actions', exact: true })
}

function vehicleLabel(page) {
  return page.viewportSize().width < 768 ? 'Edit Vehicles' : 'Add Vehicle'
}

test.beforeEach(async ({ page }) => {
  const errors = []
  const externalRequests = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('**/*', route => {
    if (new URL(route.request().url()).origin === 'http://127.0.0.1:4192') return route.continue()
    externalRequests.push(route.request().url())
    return route.abort()
  })
  page.quickActionChecks = { errors, externalRequests }
})

test.afterEach(async ({ page }) => {
  expect(page.quickActionChecks.errors).toEqual([])
  expect(page.quickActionChecks.externalRequests).toEqual([])
})

test('exactly the intended three actions are visible at each breakpoint', async ({ page }) => {
  const card = await openDashboard(page)
  const rows = card.locator('a:visible, button:visible')
  await expect(rows).toHaveCount(3)
  for (const [index, label] of ['Edit Profile', 'Book Appointment', vehicleLabel(page)].entries()) {
    await expect(rows.nth(index)).toContainText(label)
  }
  await expect(card.getByRole('link')).toHaveCount(1)
  await expect(card.getByRole('link', { name: 'Book Appointment', exact: true })).toHaveAttribute('href', '/monthlybooking')
  await expect(card.getByRole('button')).toHaveCount(2)
  await expect(card.locator('button:visible').getByText('Coming soon', { exact: true })).toHaveCount(2)
  const hiddenLabel = page.viewportSize().width < 768 ? 'Add Vehicle' : 'Edit Vehicles'
  await expect(card.getByRole('button', { name: hiddenLabel + ' Coming soon', exact: true, includeHidden: true })).toBeHidden()
  await expect(card.locator('a[href="#edit-profile"], a[href="#"], a[href=""]')).toHaveCount(0)
})

test('unavailable actions are disabled and cannot activate by mouse or focus', async ({ page }) => {
  const card = await openDashboard(page)
  for (const label of ['Edit Profile', vehicleLabel(page)]) {
    const button = card.getByRole('button', { name: label + ' Coming soon', exact: true })
    await expect(button).toBeDisabled()
    await expect(button).not.toHaveAttribute('href')
    await button.scrollIntoViewIfNeeded()
    const box = await button.boundingBox()
    // A real pointer click must be ignored by the native disabled button.
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await button.evaluate(el => el.focus())
    await expect(button).not.toBeFocused()
    await expect(page).toHaveURL('http://127.0.0.1:4192/customerportal')
    await expect(card).toBeVisible()
  }
})

test('Book Appointment reaches the real booking route and back returns to the dashboard', async ({ page }) => {
  const card = await openDashboard(page)
  await card.getByRole('link', { name: 'Book Appointment', exact: true }).click()
  await expect(page).toHaveURL('http://127.0.0.1:4192/monthlybooking')
  await expect(page.getByRole('heading', { name: 'Monthly Booking', exact: true })).toBeAttached()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Monthly Booking', exact: true })).toBeAttached()
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Customer Dashboard', exact: true })).toBeVisible()
  for (const name of ['Next Appointment', 'My Vehicles', 'Quick Actions', 'Recent Activity']) {
    await expect(page.getByRole('region', { name, exact: true })).toBeVisible()
  }
})

test('keyboard skips unavailable actions and activates the visibly focused booking link', async ({ page }) => {
  const card = await openDashboard(page)
  const previous = page.getByRole('button', { name: 'View All Vehicles', exact: true })
  const booking = card.getByRole('link', { name: 'Book Appointment', exact: true })
  await previous.focus()
  await page.keyboard.press('Tab')
  await expect(booking).toBeFocused()
  await expect(booking).toHaveCSS('outline-style', 'solid')
  await expect(booking).toHaveCSS('outline-width', '2px')
  await page.keyboard.press('Shift+Tab')
  await expect(previous).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(booking).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('http://127.0.0.1:4192/monthlybooking')
})

test('card and action styling retain dashboard spacing, typography, and colors', async ({ page }, testInfo) => {
  const card = await openDashboard(page)
  await page.evaluate(() => document.fonts.ready)
  await page.mouse.move(0, 0)
  const heading = card.getByRole('heading', { name: 'Quick Actions', exact: true })
  await expect(heading.locator('..')).toHaveCSS('background-color', 'rgb(50, 50, 50)')
  await expect(heading).toHaveCSS('color', 'rgb(255, 255, 255)')
  await expect(heading).toHaveCSS('font-size', '24px')
  const booking = card.getByRole('link', { name: 'Book Appointment', exact: true })
  const colors = await booking.evaluate(el => ({
    background: getComputedStyle(el).backgroundColor,
    text: getComputedStyle(el).color,
  }))
  let previousBox
  for (const row of await card.locator('a:visible, button:visible').all()) {
    await expect(row).toHaveCSS('padding-top', '16px')
    await expect(row).toHaveCSS('padding-bottom', '16px')
    await expect(row).toHaveCSS('padding-left', '24px')
    await expect(row).toHaveCSS('padding-right', '24px')
    await expect(row).toHaveCSS('font-size', '20px')
    await expect(row).toHaveCSS('font-weight', '800')
    await expect(row).toHaveCSS('border-radius', '10px')
    await expect(row).toHaveCSS('background-color', colors.background)
    await expect(row).toHaveCSS('color', colors.text)
    const box = await row.boundingBox()
    if (previousBox) expect(box.y - (previousBox.y + previousBox.height)).toBe(16)
    previousBox = box
    expect(await row.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await card.screenshot({ path: testInfo.outputPath('quick-actions.png') })
})

test('configuration can enable future actions without editing the component or inventing test pages', async ({ page }) => {
  const configuredActions = Object.fromEntries(Object.entries(customerQuickActions).map(([id, href]) => (
    [id, href ?? '/monthlybooking']
  )))
  // Exercise the enabled state with a confirmed existing route in this test only.
  await page.route('**/src/config/customerQuickActions.js*', route => route.fulfill({
    contentType: 'application/javascript',
    body: 'export const customerQuickActions = ' + JSON.stringify(configuredActions),
  }))
  const card = await openDashboard(page)
  await expect(card.getByRole('link')).toHaveCount(3)
  await expect(card.getByRole('button')).toHaveCount(0)
  await expect(card.getByRole('link', { name: vehicleLabel(page), exact: true })).toHaveAttribute('href', '/monthlybooking')
  await card.getByRole('link', { name: 'Edit Profile', exact: true }).click()
  await expect(page).toHaveURL('http://127.0.0.1:4192/monthlybooking')
})

test('real customer access checks still handle loading, signed-out, denied, and admin states', async ({ page }) => {
  await page.goto('/customerportal?access=loading')
  await expect(page.getByText('Verifying account access...', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Quick Actions', exact: true })).toHaveCount(0)
  await page.goto('/customerportal?access=signed-out')
  await expect(page).toHaveURL('http://127.0.0.1:4192/login')
  await page.goto('/customerportal?access=denied')
  await expect(page.getByRole('heading', { name: 'Access Denied', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Quick Actions', exact: true })).toHaveCount(0)
  await page.goto('/customerportal?role=admin')
  await expect(page).toHaveURL('http://127.0.0.1:4192/adminportal')
  const card = await openDashboard(page)
  await expect(card).toBeVisible()
  await expect(page.getByRole('region', { name: 'Next Appointment', exact: true })).toContainText('Tire Patch')
  await expect(page.getByRole('region', { name: 'My Vehicles', exact: true })).toContainText('2022 Toyota Camry')
})
