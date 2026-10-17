import { test, expect } from '@playwright/test'

test('contains search, counts, filters, clearing and literal punctuation (fixtures)', async ({ page }, testInfo) => {
  await page.goto('/__gp24/')
  const search = page.getByRole('searchbox', { name: 'Search appointments' })
  await expect(page.getByText('6 of 17', { exact: true })).toBeVisible()
  await search.fill('example.invalid')
  await expect(page.getByText('6 of 17', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Next appointments page' }).click()
  await expect(page.getByText('12 of 17', { exact: true })).toBeVisible()
  await search.fill('')
  await search.pressSequentially('aLp')
  await expect(page.getByText('4 of 4', { exact: true })).toBeVisible()
  await expect(page.locator('tbody tr td:nth-child(2)')).toHaveText(Array(4).fill('Alpha'))
  await expect(page.getByRole('button', { name: 'Previous appointments page' })).toBeDisabled()
  await page.getByLabel('Filter appointments').selectOption('za')
  await expect(page.getByText('4 of 4', { exact: true })).toBeVisible()
  await page.getByLabel('Appointment date', { exact: true }).fill('2026-10-17')
  await expect(page.getByText('2 of 2', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Clear date' }).click()

  for (const [term, count] of [['Test 03', '1 of 1'], ['fixture16@', '1 of 1'], ['555-01', '6 of 17'], ['2026-10-17', '6 of 6'], ['10/17/26', '6 of 6'], ['10-17-2026', '6 of 6'], ['2026-10', '6 of 17'], ['2026', '6 of 17']]) {
    await search.fill(term)
    await expect(page.getByText(count, { exact: true })).toBeVisible()
  }
  for (const term of ['%', '_', '*', '\\', '+tag,(quoted)"']) {
    await search.fill(term)
    await expect(page.getByText('1 of 1', { exact: true })).toBeVisible()
    await expect(page.locator('tbody tr td:nth-child(3)')).toHaveText('Test 00')
  }
  for (const term of ['no-such-person', '.*', 'x",status.eq.completed', '2026-02-30', 'SYNTHETIC TEST FIXTURE']) {
    await search.fill(term)
    await expect(page.getByText('No completed appointments found.')).toBeVisible()
    await expect(page.getByText('0 of 0', { exact: true })).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
  }
  for (const term of ['', '   ']) {
    await search.fill(term)
    await expect(page.getByText('6 of 17', { exact: true })).toBeVisible()
  }
  await search.fill('Alpha')
  await expect(page.getByText('4 of 4', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  const box = await search.boundingBox()
  expect(box.height).toBe(46)
  expect(box.x + box.width).toBeLessThanOrEqual(testInfo.project.use.viewport.width)
  await page.screenshot({ path: testInfo.outputPath('search.png'), fullPage: true })
})

for (const auth of ['anonymous', 'customer']) {
  test(`${auth} cannot request or search appointments (synthetic identity)`, async ({ page }) => {
    const appointmentRequests = []
    page.on('request', (request) => {
      if (request.url().includes('/appointment_filter_records')) appointmentRequests.push(request.url())
    })
    await page.goto(`/__gp24/?auth=${auth}`)
    await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible()
    await expect(page.getByRole('searchbox')).toHaveCount(0)
    expect(appointmentRequests).toEqual([])
  })
}

test('older search response cannot replace newer results; loading and error recover (fixtures)', async ({ page }) => {
  await page.goto('/__gp24/')
  await expect(page.getByText('6 of 17', { exact: true })).toBeVisible()
  const search = page.getByRole('searchbox', { name: 'Search appointments' })
  let releaseOld
  const oldGate = new Promise((resolve) => { releaseOld = resolve })
  await page.route('**/appointment_filter_records?*', async (route) => {
    const term = new URL(route.request().url()).searchParams.get('or') || ''
    if (term.includes('Alpha')) {
      const response = await route.fetch()
      await oldGate
      await route.fulfill({ response })
    } else if (term.includes('failure')) {
      await route.fulfill({ status: 500, json: { message: 'Search fixture failure' } })
    } else await route.continue()
  })
  const oldRequest = page.waitForRequest((req) => new URL(req.url()).searchParams.get('or')?.includes('Alpha'))
  await search.fill('Alpha')
  await oldRequest
  await expect(page.getByRole('status')).toHaveText('Loading appointments...')
  await expect(page.getByRole('button', { name: 'Next appointments page' })).toBeDisabled()
  await search.fill('Baker')
  await expect(page.getByText('4 of 4', { exact: true })).toBeVisible()
  const oldResponse = page.waitForResponse((res) => new URL(res.url()).searchParams.get('or')?.includes('Alpha'))
  releaseOld()
  await oldResponse
  // A sentinel request after the old response also permits React to process it.
  await expect(page.locator('tbody tr td:nth-child(2)')).toHaveText(Array(4).fill('Baker'))
  await search.fill('failure')
  await expect(page.getByRole('alert')).toContainText('Search fixture failure')
  await expect(page.getByText('No completed appointments found.')).toHaveCount(0)
  await search.fill('')
  await expect(page.getByText('6 of 17', { exact: true })).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
})
