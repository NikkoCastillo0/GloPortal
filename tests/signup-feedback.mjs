import { test, expect } from '@playwright/test'

const validValues = {
  'first-name': 'Alex', 'last-name': 'Rivera', email: 'alex@example.test',
  phone: '(415) 555-2671', password: ' exact password ', 'confirm-password': ' exact password ',
}

async function fillForm(page, overrides = {}) {
  for (const [id, value] of Object.entries({ ...validValues, ...overrides })) {
    await page.locator(`#${id}`).fill(value)
  }
}

test.beforeEach(async ({ page }) => {
  const unexpectedRequests = []
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.context().route('**/*', route => {
    if (new URL(route.request().url()).origin === 'http://127.0.0.1:4177') return route.continue()
    unexpectedRequests.push(route.request().url())
    return route.abort()
  })
  page.__gp91Checks = { unexpectedRequests, pageErrors }
  await page.goto('/__gp91/')
  await expect(page.getByRole('heading', { name: 'Sign Up', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => Boolean(window.__gp91Mock))).toBe(true)
})

test.afterEach(async ({ page }) => {
  expect(page.__gp91Checks.unexpectedRequests).toEqual([])
  expect(page.__gp91Checks.pageErrors).toEqual([])
})

test('existing six fields, labels, responsive layout, and Login link remain intact', async ({ page }, testInfo) => {
  await expect(page.locator('form input')).toHaveCount(6)
  for (const id of Object.keys(validValues)) {
    await expect(page.locator(`#${id}`)).toHaveAttribute('required', '')
    expect(await page.locator(`#${id}`).evaluate(input => input.labels.length)).toBe(1)
  }
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByRole('status')).toHaveCount(0)
  await expect(page.locator('form')).toHaveAttribute('aria-busy', 'false')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: testInfo.outputPath('signup-initial.png'), fullPage: true })
  await expect(page.getByRole('link', { name: 'Log in', exact: true })).toHaveAttribute('href', '/login')
  await page.getByRole('link', { name: 'Log in', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Mock Login page' })).toBeVisible()
})

test('confirmed success preserves payload, loading state, instructions, and password clearing', async ({ page }, testInfo) => {
  await page.evaluate(() => { window.__gp91Mock.delay = 700 })
  await fillForm(page, { 'first-name': ' María José ', 'last-name': ' O’Neill-Smith ', email: ' alex@example.test ', phone: ' +1 (415) 555-2671 ' })
  await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Creating Account...' })).toBeDisabled()
  await expect(page.locator('form')).toHaveAttribute('aria-busy', 'true')
  // Exercise the handler guard as well as the disabled button.
  await page.locator('form').evaluate(form => form.requestSubmit())
  expect(await page.evaluate(() => window.__gp91Mock.calls.length)).toBe(1)
  await expect(page.getByRole('status')).toHaveText('Your account was created. Check alex@example.test for a confirmation link, then confirm your email before logging in.')
  await expect(page.getByRole('button', { name: 'Sign Up', exact: true })).toBeEnabled()
  await expect(page.locator('form')).toHaveAttribute('aria-busy', 'false')
  await expect(page.locator('#password')).toHaveValue('')
  await expect(page.locator('#confirm-password')).toHaveValue('')
  await expect(page.locator('#first-name')).toHaveValue(' María José ')
  expect(await page.evaluate(() => window.__gp91Mock.calls)).toEqual([{
    email: 'alex@example.test', password: validValues.password,
    options: { data: { first_name: 'María José', last_name: 'O’Neill-Smith', phone: '+1 (415) 555-2671' } },
  }])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('signup-success.png'), fullPage: true })
})

for (const [scenario, message] of [
  ['duplicate', 'An account with this email may already exist.'],
  ['duplicate-code', 'An account with this email may already exist.'],
  ['email-exists', 'An account with this email may already exist.'],
  ['email-limit', 'Too many signup emails have been requested.'],
  ['legacy-email-limit', 'Too many signup emails have been requested.'],
  ['request-limit', 'Too many sign-up attempts.'],
  ['http-limit', 'Too many sign-up attempts.'],
  ['weak-password', 'The account service rejected this password.'],
  ['network', 'The account service could not be reached.'],
  ['failure', 'Unable to create your account. Please try again.'],
  ['throw-null', 'Unable to create your account. Please try again.'],
  ['throw-string', 'Unable to create your account. Please try again.'],
  ['throw-number', 'Unable to create your account. Please try again.'],
  ['throw-object', 'Unable to create your account. Please try again.'],
  ['throw-error', 'Unable to create your account. Please try again.'],
  ['malformed-null', 'Unable to create your account. Please try again.'],
  ['malformed-empty', 'Unable to create your account. Please try again.'],
  ['missing-user', 'Unable to create your account. Please try again.'],
  ['missing-user-id', 'Unable to create your account. Please try again.'],
  ['missing-error', 'Unable to create your account. Please try again.'],
  ['malformed-session', 'Unable to create your account. Please try again.'],
]) {
  test(`${scenario} gives safe feedback, unlocks submission, and permits retry`, async ({ page }, testInfo) => {
    await page.evaluate(value => { window.__gp91Mock.scenario = value }, scenario)
    await fillForm(page)
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText(message)
    await expect(page.getByRole('alert')).not.toContainText('PRIVATE DIAGNOSTIC')
    await expect(page.getByRole('status')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Sign Up', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign Up', exact: true })).toBeEnabled()
    await expect(page.locator('form')).toHaveAttribute('aria-busy', 'false')
    await expect(page.locator('#password')).toHaveValue(validValues.password)
    if (scenario === 'weak-password') {
      await page.screenshot({ path: testInfo.outputPath('signup-service-error.png'), fullPage: true })
    }
    await page.evaluate(() => { window.__gp91Mock.scenario = 'confirmation' })
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Your account was created.')
    await expect(page.getByRole('alert')).toHaveCount(0)
    expect(await page.evaluate(() => window.__gp91Mock.calls.length)).toBe(2)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('authenticated success preserves the existing redirect and keyboard submission', async ({ page }) => {
  await page.evaluate(() => { window.__gp91Mock.scenario = 'session' })
  await fillForm(page)
  await page.locator('#confirm-password').press('Enter')
  await expect(page.getByRole('heading', { name: 'Mock customer portal' })).toBeVisible()
  expect(await page.evaluate(() => window.__gp91Mock.calls.length)).toBe(1)
})
