import { test, expect } from '@playwright/test'

test('one heading-level edit link replaces row actions and opens the protected page', async ({ page }, testInfo) => {
  await page.goto('/__gp24/')
  await expect(page.getByText('6 of 17', { exact: true })).toBeVisible()

  const heading = page.getByRole('heading', { name: 'All Appointments', exact: true })
  const edit = page.getByRole('link', { name: 'Edit Appointments', exact: true })
  await expect(edit).toHaveCount(1)
  await expect(edit).toHaveAttribute('href', '/appointments/edit')
  await expect(heading.locator('..').getByRole('link')).toHaveCount(1)
  await expect(page.getByRole('columnheader', { name: 'Actions', exact: true })).toHaveCount(0)
  await expect(page.locator('thead th')).toHaveCount(9)
  await expect(page.locator('tbody tr')).toHaveCount(6)
  await expect(page.locator('tbody a, tbody button')).toHaveCount(0)
  for (const row of await page.locator('tbody tr').all()) {
    await expect(row.locator('td')).toHaveCount(9)
  }

  const headingBox = await heading.boundingBox()
  const editBox = await edit.boundingBox()
  const viewport = testInfo.project.use.viewport
  expect(editBox.x).toBeGreaterThanOrEqual(0)
  expect(editBox.x + editBox.width).toBeLessThanOrEqual(viewport.width)
  if (viewport.width >= 768) {
    expect(editBox.x).toBeGreaterThanOrEqual(headingBox.x + headingBox.width)
    expect(Math.abs(editBox.y + editBox.height / 2 - headingBox.y - headingBox.height / 2)).toBeLessThan(2)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.screenshot({ path: testInfo.outputPath('edit-appointments-heading.png'), fullPage: true })

  await edit.click()
  await expect(page).toHaveURL(/\/appointments\/edit$/)
  await expect(page.getByRole('heading', { name: 'Edit Appointment', exact: true })).toBeVisible()
  await expect(page.getByText('Appointment management screen', { exact: true })).toBeVisible()
})

test('general trailing-slash and existing appointment-specific edit routes remain available', async ({ page }) => {
  for (const route of ['/appointments/edit/', '/appointments/synthetic-appointment/edit']) {
    await page.goto(route)
    await expect(page.getByRole('heading', { name: 'Edit Appointment', exact: true })).toBeVisible()
    await expect(page.getByText('Appointment management screen', { exact: true })).toBeVisible()
  }
})

for (const role of ['anonymous', 'customer']) {
  test(`${role} cannot access either edit route`, async ({ page }) => {
    for (const route of ['/appointments/edit', '/appointments/synthetic-appointment/edit']) {
      await page.goto(`${route}?auth=${role}`)
      await expect(page.getByRole('heading', { name: 'Access Denied', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Edit Appointment', exact: true })).toHaveCount(0)
    }
  })
}

test('edit navigation and nine-column status rows work when the table has no records', async ({ page }) => {
  for (const state of ['empty', 'error', 'loading']) {
    await page.goto(`/__gp24/?state=${state}`)
    await expect(page.getByRole('link', { name: 'Edit Appointments', exact: true })).toBeVisible()
    await expect(page.locator('thead th')).toHaveCount(9)
    await expect(page.locator('tbody td')).toHaveAttribute('colspan', '9')
    await expect(page.locator('tbody a, tbody button')).toHaveCount(0)
  }
})
