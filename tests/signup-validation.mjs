import { test, expect } from '@playwright/test'

const validValues = {
  'first-name': 'Alex',
  'last-name': 'Rivera',
  email: 'alex@example.test',
  phone: '(415) 555-2671',
  password: ' exact password ',
  'confirm-password': ' exact password ',
}
const requiredMessages = {
  'first-name': 'First name is required.',
  'last-name': 'Last name is required.',
  email: 'Email is required.',
  phone: 'Phone number is required.',
  password: 'Password is required.',
  'confirm-password': 'Confirm password is required.',
}

async function fillForm(page, overrides = {}) {
  for (const [id, value] of Object.entries({ ...validValues, ...overrides })) {
    await page.locator(`#${id}`).fill(value)
  }
}

async function expectNoCalls(page) {
  expect(await page.evaluate(() => window.__gp93Mock.calls)).toEqual([])
}

test.beforeEach(async ({ page }) => {
  const unexpectedRequests = []
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.context().route('**/*', route => {
    if (new URL(route.request().url()).origin === 'http://127.0.0.1:4176') return route.continue()
    unexpectedRequests.push(route.request().url())
    return route.abort()
  })
  page.__gp93Checks = { unexpectedRequests, pageErrors }
  await page.goto('/__gp93/')
  await expect(page.getByRole('heading', { name: 'Sign Up', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => Boolean(window.__gp93Mock))).toBe(true)
})

test.afterEach(async ({ page }) => {
  expect(page.__gp93Checks.unexpectedRequests).toEqual([])
  expect(page.__gp93Checks.pageErrors).toEqual([])
})

test('existing fields, labels, layout, and Login link are preserved', async ({ page }, testInfo) => {
  await expect(page.locator('form input')).toHaveCount(6)
  for (const id of Object.keys(validValues)) {
    const input = page.locator(`#${id}`)
    await expect(input).toHaveAttribute('required', '')
    await expect(input).toHaveAttribute('aria-invalid', 'false')
    expect(await input.evaluate(element => element.labels.length)).toBe(1)
  }
  await expect(page.locator('form [id$="-error"]')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Log in', exact: true })).toHaveAttribute('href', '/login')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: testInfo.outputPath('signup-initial.png'), fullPage: true })
  await page.getByRole('link', { name: 'Log in', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Mock Login page' })).toBeVisible()
})

test('empty submission reports all six errors, associates them, and focuses the first field', async ({ page }, testInfo) => {
  await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
  for (const [id, message] of Object.entries(requiredMessages)) {
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-describedby', `${id}-error`)
    await expect(page.locator(`#${id}-error`)).toHaveText(message)
  }
  await expect(page.locator('#first-name')).toBeFocused()
  await expectNoCalls(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('signup-required-errors.png'), fullPage: true })
})

for (const [id, message] of Object.entries(requiredMessages)) {
  test(`missing ${id} blocks submission and focuses its input`, async ({ page }) => {
    await fillForm(page, { [id]: '' })
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
    await expect(page.locator('form [id$="-error"]')).toHaveCount(1)
    await expect(page.locator(`#${id}-error`)).toHaveText(message)
    await expect(page.locator(`#${id}`)).toBeFocused()
    await expectNoCalls(page)
  })
}

test('whitespace-only names, email, and phone are rejected', async ({ page }) => {
  await fillForm(page, { 'first-name': '   ', 'last-name': '   ', email: '   ', phone: '   ' })
  await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
  for (const id of ['first-name', 'last-name', 'email', 'phone']) {
    await expect(page.locator(`#${id}-error`)).toHaveText(requiredMessages[id])
  }
  await expectNoCalls(page)
})

test('invalid email and US phone formats block requests and clear when corrected', async ({ page }) => {
  await fillForm(page, { email: 'alex..rivera@example.com', phone: '+44 20 7946 0958' })
  await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
  await expect(page.locator('#email-error')).toHaveText('Enter a valid email address.')
  await expect(page.locator('#phone-error')).toHaveText('Enter a valid US phone number.')
  await expect(page.locator('#email')).toBeFocused()
  await expectNoCalls(page)
  await page.locator('#email').fill('Alex.Rivera+booking@Sub.Example.COM')
  await expect(page.locator('#email-error')).toHaveCount(0)
  await expect(page.locator('#email')).not.toHaveAttribute('aria-describedby')
  await page.locator('#phone').fill('+1 (415) 555-2671')
  await expect(page.locator('form [id$="-error"]')).toHaveCount(0)
  await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Your account was created.')
  expect(await page.evaluate(() => window.__gp93Mock.calls.length)).toBe(1)
})

test('password mismatches include case and whitespace and recheck after password changes', async ({ page }) => {
  await fillForm(page, { password: 'Password', 'confirm-password': 'password' })
  await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
  await expect(page.locator('#confirm-password-error')).toHaveText('Passwords must match exactly.')
  await expect(page.locator('#confirm-password')).toBeFocused()
  await page.locator('#confirm-password').fill('Password ')
  await expect(page.locator('#confirm-password-error')).toBeVisible()
  await page.locator('#confirm-password').fill('Password')
  await expect(page.locator('#confirm-password-error')).toHaveCount(0)
  await page.locator('#password').fill('Changed password')
  await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
  await expect(page.locator('#confirm-password-error')).toBeVisible()
  await expectNoCalls(page)
})

for (const password of ['a', '   ', '🔑']) {
  test(`matching ${JSON.stringify(password)} passwords have no added length or complexity rule`, async ({ page }) => {
    await fillForm(page, { password, 'confirm-password': password })
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Your account was created.')
    expect(await page.evaluate(() => window.__gp93Mock.calls[0].password)).toBe(password)
  })
}

test('valid submission preserves the existing payload, loading state, and confirmation flow', async ({ page }) => {
  await page.evaluate(() => { window.__gp93Mock.delay = 600 })
  await fillForm(page, {
    'first-name': ' María José ', 'last-name': ' O’Neill-Smith ',
    email: ' alex@example.test ', phone: ' +1 (415) 555-2671 ',
  })
  await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Creating Account...' })).toBeDisabled()
  await expect(page.getByRole('status')).toContainText('Check alex@example.test for a confirmation link')
  await expect(page.locator('#password')).toHaveValue('')
  await expect(page.locator('#confirm-password')).toHaveValue('')
  await expect(page.getByRole('button', { name: 'Sign Up', exact: true })).toBeEnabled()
  expect(await page.evaluate(() => window.__gp93Mock.calls)).toEqual([{
    email: 'alex@example.test', password: validValues.password,
    options: { data: { first_name: 'María José', last_name: 'O’Neill-Smith', phone: '+1 (415) 555-2671' } },
  }])
})

for (const [scenario, message] of [
  ['failure', 'Unable to create your account. Please try again.'],
  ['network', 'Unable to create your account. Please try again.'],
  ['rate-limit', 'Too many signup emails have been requested.'],
  ['duplicate', 'An account with this email may already exist.'],
]) {
  test(`existing ${scenario} handling still works after validation and allows retry`, async ({ page }) => {
    await page.evaluate(value => { window.__gp93Mock.scenario = value }, scenario)
    await fillForm(page)
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText(message)
    await expect(page.getByRole('button', { name: 'Sign Up', exact: true })).toBeEnabled()
    await expect(page.locator('#password')).toHaveValue(validValues.password)
    await page.evaluate(() => { window.__gp93Mock.scenario = 'confirmation' })
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Your account was created.')
    await expect(page.getByRole('alert')).toHaveCount(0)
    expect(await page.evaluate(() => window.__gp93Mock.calls.length)).toBe(2)
  })
}

test('existing authenticated-success redirect is preserved', async ({ page }) => {
  await page.evaluate(() => { window.__gp93Mock.scenario = 'session' })
  await fillForm(page)
  await page.locator('#confirm-password').press('Enter')
  await expect(page.getByRole('heading', { name: 'Mock customer portal' })).toBeVisible()
  expect(await page.evaluate(() => window.__gp93Mock.calls.length)).toBe(1)
})
