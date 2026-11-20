import { test, expect } from '@playwright/test'

test('six responsive overview cards link to their registered pages', async ({ page }) => {
  await page.goto('/__admin-preview/')
  for (const title of ['Appointments', 'Customers', 'Inventory', 'Services', 'Appointment Requests', 'Shop Availability']) {
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
  }
  for (const [label, path, heading] of [
    ['View All Appointments', '/viewappointments', 'All Appointments Preview'],
    ['View All Customers', '/viewcustomers', 'All Customers Preview'],
    ['View All Inventory', '/viewinventory', 'All Inventory Preview'],
    ['View Services', '/viewservices', 'View Services Preview'],
    ['Review Requests', '/viewappointmentrequests', 'Appointment Requests Preview'],
    ['Manage Availability', '/shopavailability', 'Shop Availability Preview'],
  ]) {
    await page.goto('/__admin-preview/')
    await page.getByRole('link', { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
  }

  await page.goto('/__admin-preview/')
  const appointments = await page.getByRole('region', { name: 'Appointments', exact: true }).boundingBox()
  const customers = await page.getByRole('region', { name: 'Customers', exact: true }).boundingBox()
  const requests = await page.getByRole('region', { name: 'Appointment Requests', exact: true }).boundingBox()
  const availability = await page.getByRole('region', { name: 'Shop Availability', exact: true }).boundingBox()
  if (page.viewportSize().width < 768) {
    expect(customers.y).toBeGreaterThan(appointments.y + appointments.height)
    expect(customers.x).toBe(appointments.x)
    expect(availability.y).toBeGreaterThan(requests.y + requests.height)
    expect(availability.x).toBe(requests.x)
  } else {
    expect(customers.y).toBe(appointments.y)
    expect(customers.x).toBeGreaterThan(appointments.x + appointments.width)
    expect(requests.width).toBe(appointments.width)
    expect(availability.y).toBe(requests.y)
    expect(availability.x).toBeGreaterThan(requests.x + requests.width)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
