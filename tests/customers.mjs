import { test, expect } from '@playwright/test'

const columns = ['Customer', 'Joined', 'Email', 'Phone', 'Vehicles', 'Completed Jobs', 'Edit']

test.beforeEach(async ({ page }) => {
  const errors = []
  const forbiddenRequests = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('**/*', route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.origin !== 'http://127.0.0.1:4184' || request.method() !== 'GET' || /\/(auth|rest|functions)\/v1\//.test(url.pathname)) {
      forbiddenRequests.push(request.url())
      return route.abort()
    }
    return route.continue()
  })
  page.gp268Checks = { errors, forbiddenRequests }
})

test.afterEach(async ({ page }) => {
  expect(page.gp268Checks.errors).toEqual([])
  expect(page.gp268Checks.forbiddenRequests).toEqual([])
})

async function checkLayout(page, testInfo, name) {
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true })
}

test('GP-301 shows all seven columns or stacked customer cards with row Edit controls', async ({ page }, testInfo) => {
  await page.goto('/viewcustomers')
  await expect(page.getByRole('heading', { name: 'All Customers', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add customer', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Edit Customers', exact: true })).toBeDisabled()
  await expect(page.getByRole('status')).toContainText('UI preview')
  if (page.viewportSize().width >= 768) {
    const table = page.getByRole('table')
    await expect(table.getByRole('columnheader')).toHaveText(columns)
    await expect(table.locator('tbody tr')).toHaveCount(2)
    const scroller = table.locator('..')
    expect(await scroller.evaluate(el => el.scrollWidth >= el.clientWidth)).toBe(true)
    await scroller.evaluate(el => { el.scrollLeft = el.scrollWidth })
    await expect(page.getByRole('button', { name: 'Edit Maria Reyes', exact: true })).toBeInViewport()
    await scroller.evaluate(el => { el.scrollLeft = 0 })
    await expect(page.getByRole('article')).toHaveCount(0)
  } else {
    await expect(page.getByRole('table')).toHaveCount(0)
    const cards = page.getByRole('article')
    await expect(cards).toHaveCount(2)
    for (const card of await cards.all()) {
      await expect(card.locator('dt')).toHaveText(columns)
      await expect(card.getByRole('button', { name: /^Edit / })).toBeDisabled()
    }
    await expect(cards.first()).toContainText('John Doe')
    await expect(cards.first()).toContainText('BMW, Honda, Chevrolet')
  }
  await checkLayout(page, testInfo, 'customer-list')
})

test('GP-301 search, date filter and pagination remain clearly UI only', async ({ page }) => {
  await page.goto('/viewcustomers')
  await page.getByRole('searchbox', { name: 'Search customers' }).fill('no matching customer')
  await page.getByRole('combobox', { name: 'Filter customers by joined date' }).selectOption('newest')
  await expect(page.getByRole('searchbox')).toHaveValue('no matching customer')
  await expect(page.getByRole('combobox')).toHaveValue('newest')
  await expect(page.getByText('John Doe', { exact: true }).filter({ visible: true })).toBeVisible()
  await expect(page.getByText('Maria Reyes', { exact: true }).filter({ visible: true })).toBeVisible()
  const pagination = page.getByRole('navigation', { name: 'Customer pagination' })
  await expect(pagination).toContainText('2 of 2')
  await expect(pagination.getByRole('button', { name: /previous/i })).toBeDisabled()
  await expect(pagination.getByRole('button', { name: /next/i })).toBeDisabled()
})
