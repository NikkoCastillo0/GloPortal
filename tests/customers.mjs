import { test, expect } from '@playwright/test'

const labels = ['First name', 'Last name', 'Email', 'Phone']
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
  await expect(page.getByRole('link', { name: 'Add customer', exact: true })).toHaveAttribute('href', '/addcustomer')
  await expect(page.getByRole('link', { name: 'Edit Customers', exact: true })).toHaveAttribute('href', '/editcustomer')
  await expect(page.getByRole('status')).toContainText('UI preview')
  if (page.viewportSize().width >= 768) {
    const table = page.getByRole('table')
    await expect(table.getByRole('columnheader')).toHaveText(columns)
    await expect(table.locator('tbody tr')).toHaveCount(2)
    const scroller = table.locator('..')
    expect(await scroller.evaluate(el => el.scrollWidth >= el.clientWidth)).toBe(true)
    await scroller.evaluate(el => { el.scrollLeft = el.scrollWidth })
    await expect(page.getByRole('link', { name: 'Edit Maria Reyes', exact: true })).toBeInViewport()
    await scroller.evaluate(el => { el.scrollLeft = 0 })
    await expect(page.getByRole('article')).toHaveCount(0)
  } else {
    await expect(page.getByRole('table')).toHaveCount(0)
    const cards = page.getByRole('article')
    await expect(cards).toHaveCount(2)
    for (const card of await cards.all()) {
      await expect(card.locator('dt')).toHaveText(columns)
      await expect(card.getByRole('link', { name: /^Edit / })).toBeVisible()
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

test('GP-302 Add customer starts blank, accepts keyboard input, and does not persist submissions', async ({ page }, testInfo) => {
  await page.goto('/viewcustomers')
  await page.evaluate(() => { window.gp268Document = 'same' })
  await page.getByRole('link', { name: 'Add customer', exact: true }).click()
  await expect(page).toHaveURL(/\/addcustomer$/)
  expect(await page.evaluate(() => window.gp268Document)).toBe('same')
  await expect(page.getByRole('heading', { name: 'Add customer', exact: true })).toBeVisible()
  const form = page.getByRole('form', { name: 'Add customer', exact: true })
  await expect(form.getByRole('textbox')).toHaveCount(4)
  for (const label of labels) await expect(form.getByLabel(label, { exact: true })).toHaveValue('')
  await expect(form.getByLabel('Email', { exact: true })).toHaveAttribute('type', 'email')
  await expect(form.getByLabel('Phone', { exact: true })).toHaveAttribute('type', 'tel')
  await checkLayout(page, testInfo, 'add-customer')
  await form.getByLabel('First name', { exact: true }).focus()
  await page.keyboard.type('Alex')
  await page.keyboard.press('Tab')
  await expect(form.getByLabel('Last name', { exact: true })).toBeFocused()
  await page.keyboard.type('Test')
  await form.getByLabel('Email', { exact: true }).fill('alex@example.test')
  await form.getByLabel('Phone', { exact: true }).fill('(831) 555-0100')
  await form.getByRole('button', { name: 'Add customer', exact: true }).click()
  await expect(form.getByRole('status')).toHaveText('Preview only — no customer details were saved.')
  await expect(page).toHaveURL(/\/addcustomer$/)
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.reload()
  for (const label of labels) await expect(page.getByLabel(label, { exact: true })).toHaveValue('')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page).toHaveURL(/\/viewcustomers$/)
  await expect(page.getByText('Alex Test', { exact: true })).toHaveCount(0)
})

test('GP-302 Edit customer is prefilled for the selected sample and does not save edits', async ({ page }, testInfo) => {
  await page.goto('/viewcustomers')
  await page.getByRole('link', { name: 'Edit Maria Reyes', exact: true }).click()
  await expect(page).toHaveURL(/\/editcustomer\?id=maria-reyes$/)
  await expect(page.getByRole('heading', { name: 'Edit customer', exact: true })).toBeVisible()
  const form = page.getByRole('form', { name: 'Edit customer', exact: true })
  const expected = ['Maria', 'Reyes', 'maria.reyes@example.com', '(831) 555-0148']
  await expect(form.getByRole('textbox')).toHaveCount(4)
  for (const [index, label] of labels.entries()) await expect(form.getByLabel(label, { exact: true })).toHaveValue(expected[index])
  await checkLayout(page, testInfo, 'edit-customer')
  await form.getByLabel('First name', { exact: true }).fill('Unsaved edit')
  await form.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(form.getByRole('status')).toContainText('no customer details were saved')
  await page.reload()
  await expect(page.getByLabel('First name', { exact: true })).toHaveValue('Maria')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page).toHaveURL(/\/viewcustomers$/)
  await page.getByRole('link', { name: 'Edit Customers', exact: true }).click()
  await expect(page.getByLabel('First name', { exact: true })).toHaveValue('John')
})

test('GP-302 direct form routes work without backend requests', async ({ page }) => {
  for (const [path, title] of [['/addcustomer', 'Add customer'], ['/editcustomer', 'Edit customer']]) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible()
  }
})
