import { test, expect } from '@playwright/test'
import { queryFixtures } from '../scripts/appointment-fixtures.mjs'

test('all sort options, pagination reset, dates and responsive containment (fixtures)', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/__gp24/')
  await expect(page.getByText('SYNTHETIC TEST FIXTURES — not live Supabase data.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'All Appointments' })).toBeVisible()
  const next = page.getByRole('button', { name: 'Next appointments page' })
  const previous = page.getByRole('button', { name: 'Previous appointments page' })
  const orders = {
    date: 'starts_at.asc,id.asc',
    az: 'last_name.asc,first_name.asc,starts_at.asc,id.asc',
    za: 'last_name.desc,first_name.desc,starts_at.asc,id.asc',
    'most-jobs': 'completed_job_count.desc,last_name.asc,first_name.asc,starts_at.asc,id.asc',
    'least-jobs': 'completed_job_count.asc,last_name.asc,first_name.asc,starts_at.asc,id.asc',
  }
  await expect(page.getByText('6 of 17', { exact: true })).toBeVisible()
  for (const [option, order] of Object.entries(orders)) {
    await next.click()
    await expect(page.getByText('12 of 17', { exact: true })).toBeVisible()
    // Ensure date is also selected from another option, triggering a real change.
    if (option === 'date') {
      await page.getByLabel('Filter appointments').selectOption('za')
      await expect(previous).toBeDisabled()
      await next.click()
      await expect(page.getByText('12 of 17', { exact: true })).toBeVisible()
    }
    const response = page.waitForResponse((res) => res.url().includes('appointment_filter_records') && new URL(res.url()).searchParams.get('order') === order)
    await page.getByLabel('Filter appointments').selectOption(option)
    const result = await response
    expect(result.ok()).toBeTruthy()
    await expect(previous).toBeDisabled()
    await expect(page.getByText('6 of 17', { exact: true })).toBeVisible()
    const expected = queryFixtures(new URLSearchParams({ order, status: 'eq.completed', limit: '6' })).rows
    await expect(page.locator('tbody tr td:nth-child(3)')).toHaveText(expected.map((row) => row.first_name))
  }
  await next.click()
  await expect(page.getByText('12 of 17', { exact: true })).toBeVisible()
  await next.click()
  await expect(page.getByText('17 of 17', { exact: true })).toBeVisible()
  await expect(next).toBeDisabled()
  await page.getByLabel('Appointment date', { exact: true }).fill('2026-10-17')
  await expect(previous).toBeDisabled()
  await expect(page.getByText('6 of 6', { exact: true })).toBeVisible()
  await expect(page.locator('tbody tr td:first-child')).toHaveText(Array(6).fill('10/17/26, 10:00 AM'))
  await page.getByLabel('Appointment date', { exact: true }).fill('2026-10-01')
  await expect(page.getByText('No completed appointments found.')).toBeVisible()
  await page.getByRole('button', { name: 'Clear date' }).click()
  await expect(page.getByText('6 of 17', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
  expect(errors).toEqual([])
  await page.screenshot({ path: testInfo.outputPath('appointments.png'), fullPage: true })
})

for (const state of ['loading', 'error', 'empty']) {
  test(`${state} state (fixtures)`, async ({ page }) => {
    await page.goto(`/__gp24/?state=${state}`)
    if (state === 'loading') {
      await expect(page.getByRole('status')).toHaveText('Loading appointments...')
      await expect(page.getByRole('region', { name: 'Appointments', exact: true })).toHaveAttribute('aria-busy', 'true')
    } else if (state === 'error') {
      await expect(page.getByRole('alert')).toContainText('Synthetic fixture failure')
      await expect(page.getByText('No completed appointments found.')).toHaveCount(0)
    } else {
      await expect(page.getByText('No completed appointments found.')).toBeVisible()
    }
    await expect(page.getByRole('button', { name: 'Previous appointments page' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Next appointments page' })).toBeDisabled()
  })
}
