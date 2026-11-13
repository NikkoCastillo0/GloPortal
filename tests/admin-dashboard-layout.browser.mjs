import { test, expect } from '@playwright/test'

test('five responsive overview cards with layout-only actions', async ({ page }) => {
  await page.goto('/__admin-preview/')
  for (const title of ['Appointments', 'Customers', 'Inventory', 'Services', 'Appointment Requests']) {
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
  }
  for (const label of ['View All Appointments', 'View All Customers', 'View All Inventory', 'Edit Services', 'Review Requests']) {
    await expect(page.getByRole('button', { name: label, exact: true })).toBeDisabled()
  }

  const appointments = await page.getByRole('region', { name: 'Appointments', exact: true }).boundingBox()
  const customers = await page.getByRole('region', { name: 'Customers', exact: true }).boundingBox()
  if (page.viewportSize().width < 768) {
    expect(customers.y).toBeGreaterThan(appointments.y + appointments.height)
    expect(customers.x).toBe(appointments.x)
  } else {
    expect(customers.y).toBe(appointments.y)
    expect(customers.x).toBeGreaterThan(appointments.x + appointments.width)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
