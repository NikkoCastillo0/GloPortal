import { test, expect } from '@playwright/test'
import { dashboardSummary } from '../scripts/admin-dashboard-fixtures.mjs'

test('database summary renders each overview and Salinas appointment times', async ({ page }) => {
  await page.goto('/__admin-preview/')
  await expect(page.getByText('Total Customers: 128', { exact: true })).toBeVisible()
  await expect(page.getByText('Registered Vehicles: 96', { exact: true })).toBeVisible()
  await expect(page.getByText('10:00 AM · Tire Patch', { exact: true })).toBeVisible()
  await expect(page.getByText('2:00 PM · TPMS Service', { exact: true })).toBeVisible()
  await expect(page.getByText('Showing 2 of 3', { exact: true })).toBeVisible()
  await expect(page.getByText('TPMS Sensors: 3', { exact: true })).toBeVisible()
  await expect(page.getByText('Active Services: 4', { exact: true })).toBeVisible()
  await expect(page.getByText('Most Popular: Tire Patch', { exact: true })).toBeVisible()
  await expect(page.getByText('6 requests waiting review', { exact: true })).toBeVisible()
})

test('empty database has truthful zero and empty states', async ({ page }) => {
  await page.goto('/__admin-preview/?state=empty')
  await expect(page.getByText('No appointments today.')).toBeVisible()
  await expect(page.getByText('No inventory items yet.')).toBeVisible()
  await expect(page.getByText('Total Customers: 0', { exact: true })).toBeVisible()
  await expect(page.getByText('Most Popular: No completed jobs yet')).toBeVisible()
  await expect(page.getByText('0 requests waiting review')).toBeVisible()
})

test('loading and failed requests never show stale counts', async ({ page }) => {
  await page.goto('/__admin-preview/?state=loading')
  await expect(page.getByRole('status')).toHaveText('Loading dashboard…')
  await expect(page.getByText('Total Customers:', { exact: false })).toHaveCount(0)
  await page.goto('/__admin-preview/?state=error')
  await expect(page.getByRole('alert')).toContainText('couldn’t load')
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Customers', exact: true })).toHaveCount(0)
})

test('retry recovers after a request failure', async ({ page }) => {
  let failing = true
  await page.route('**/__admin-api/summary*', async (route) => {
    if (failing) return route.fulfill({ json: { data: null, error: { code: 'offline' } } })
    await route.continue()
  })
  await page.goto('/__admin-preview/')
  await expect(page.getByRole('alert')).toBeVisible()
  failing = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByText('Total Customers: 128', { exact: true })).toBeVisible()
})

for (const [auth, path, heading] of [
  ['guest', '/login', 'Login Preview'],
  ['customer', '/customerportal', 'Customer Portal Preview'],
]) {
  test(`${auth} cannot see the shop overview`, async ({ page }) => {
    await page.goto(`/__admin-preview/?auth=${auth}`)
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Customers', exact: true })).toHaveCount(0)
  })
}

test('sign-out removes a previously visible summary', async ({ page }) => {
  await page.goto('/__admin-preview/')
  await expect(page.getByText('Total Customers: 128', { exact: true })).toBeVisible()
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('admin-preview-auth', { detail: 'guest' })))
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Login Preview', exact: true })).toBeVisible()
  await expect(page.getByText('Total Customers: 128', { exact: true })).toHaveCount(0)
})

test('long database names wrap without horizontal overflow', async ({ page }) => {
  const data = structuredClone(dashboardSummary)
  data.lowestStock[0].name = 'LongInventoryName'.repeat(12)
  data.todayAppointments[0].serviceName = 'LongServiceName'.repeat(12)
  data.popularService = 'LongServiceName'.repeat(12)
  await page.route('**/__admin-api/summary*', (route) => route.fulfill({ json: { data, error: null } }))
  await page.goto('/__admin-preview/')
  await expect(page.getByText('Total Customers: 128', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
