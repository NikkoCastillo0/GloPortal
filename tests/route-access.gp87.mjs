import { test, expect } from '@playwright/test'

const user = { id: '00000000-0000-4000-8000-000000000087', aud: 'authenticated', role: 'authenticated', email: 'gp87@example.test' }
const storageKey = 'sb-127-auth-token'
const protectedRoutes = ['/customerportal', '/adminportal', '/viewappointments', '/editappointment']

async function mockAccount(page, { role = 'customer', expired = false, rejected = false, profileError = false, holdProfile, seed = true } = {}) {
  const expiresAt = Math.floor(Date.now() / 1000) + (expired ? -3600 : 3600)
  const token = [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify({ sub: user.id, role: 'authenticated', exp: expiresAt })).toString('base64url'),
    'synthetic-signature',
  ].join('.')
  const session = { access_token: token, refresh_token: 'gp87-fake-refresh', token_type: 'bearer', expires_at: expiresAt, expires_in: 3600, user }
  if (seed) {
    await page.addInitScript(({ storageKey, session }) => {
      localStorage.setItem(storageKey, JSON.stringify(session))
    }, { storageKey, session })
  }

  await page.route('**/__gp87-api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/auth/v1/logout')) return route.fulfill({ status: 204 })
    if ((path.endsWith('/auth/v1/token') && expired) || rejected) {
      return route.fulfill({ status: 401, json: { message: 'Invalid test session', code: 'refresh_token_not_found' } })
    }
    if (path.endsWith('/auth/v1/token')) return route.fulfill({ json: session })
    if (path.endsWith('/auth/v1/user')) return route.fulfill({ json: user })
    if (path.endsWith('/rest/v1/profiles')) {
      if (holdProfile) await holdProfile
      return profileError
        ? route.fulfill({ status: 403, json: { message: 'Synthetic profile failure' } })
        : route.fulfill({ json: role === null ? null : { role } })
    }
    if (path.endsWith('/rest/v1/appointment_filter_records')) {
      return route.fulfill({ json: [], headers: { 'content-range': '0-0/0' } })
    }
    throw new Error(`Unexpected synthetic request: ${route.request().method()} ${path}`)
  })
}

test('guests are redirected from each protected route; public pages remain public', async ({ page }, testInfo) => {
  await page.route('**/__gp87-api/**', (route) => route.abort())
  for (const path of protectedRoutes) {
    await page.goto(path)
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Log In', exact: true })).toBeVisible()
    await expect(page.getByText(/This is the (Customer|Admin) Portal/)).toHaveCount(0)
  }
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password')
  await page.getByLabel('Email', { exact: true }).fill('gp87@example.test')
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Password', { exact: true })).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('login-guest.png'), fullPage: true })
  for (const path of ['/', '/signup', '/monthlybooking']) {
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(`${path === '/' ? '/' : path}$`))
    await expect(page.getByText('Checking account access...')).toHaveCount(0)
  }
})

for (const role of ['customer', 'admin']) {
  test(`GP-85 sign-in still navigates a ${role} to their portal`, async ({ page }) => {
    await mockAccount(page, { role, seed: false })
    await page.goto('/login')
    await page.getByLabel('Email', { exact: true }).fill('gp87@example.test')
    await page.getByLabel('Password', { exact: true }).fill('Test-only-123!')
    await page.getByRole('button', { name: 'Log In', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/${role}portal$`))
    await expect(page.getByRole('heading')).toContainText(`This is the ${role === 'admin' ? 'Admin' : 'Customer'} Portal`)
  })

  test(`${role} sessions open their portal, survive reload, and leave Login and wrong-role pages`, async ({ page }) => {
    await mockAccount(page, { role })
    const destination = `/${role}portal`
    for (const path of ['/login', role === 'customer' ? '/adminportal' : '/customerportal', destination]) {
      await page.goto(path)
      await expect(page).toHaveURL(new RegExp(`${destination}$`))
      await expect(page.getByRole('heading', { name: `This is the ${role === 'admin' ? 'Admin' : 'Customer'} Portal !` })).toBeVisible()
    }
    await page.reload()
    await expect(page.getByRole('heading')).toContainText(`This is the ${role === 'admin' ? 'Admin' : 'Customer'} Portal`)
    if (role === 'customer') {
      for (const path of ['/viewappointments', '/editappointment']) {
        await page.goto(path)
        await expect(page).toHaveURL(/\/customerportal$/)
      }
    } else {
      await page.goto('/editappointment')
      await expect(page.getByRole('heading', { name: 'Edit Appointment', exact: true })).toBeVisible()
      await page.goto('/viewappointments')
      await expect(page.getByRole('heading', { name: 'All Appointments', exact: true })).toBeVisible()
    }
  })
}

for (const scenario of [{ expired: true }, { rejected: true }]) {
  test(`${scenario.expired ? 'expired' : 'rejected'} session cannot open protected content`, async ({ page }) => {
    await mockAccount(page, scenario)
    await page.goto('/adminportal')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Log In', exact: true })).toBeVisible()
  })
}

for (const scenario of [{ role: null }, { role: 'unknown' }, { profileError: true }]) {
  test(`unverified profile ${JSON.stringify(scenario)} fails closed without a redirect loop`, async ({ page }) => {
    await mockAccount(page, scenario)
    await page.goto('/adminportal')
    await expect(page.getByRole('heading', { name: 'Access Denied', exact: true })).toBeVisible()
    await expect(page.getByText('This is the Admin Portal !')).toHaveCount(0)
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Access Denied', exact: true })).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })
}

test('sign-out removes protected content immediately', async ({ page }) => {
  await mockAccount(page)
  await page.goto('/customerportal')
  await expect(page.getByText('This is the Customer Portal !')).toBeVisible()
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.js')
    await supabase.auth.signOut({ scope: 'local' })
  })
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByText('This is the Customer Portal !')).toHaveCount(0)
})

test('pending role check does not expose content or restore access after sign-out', async ({ page }) => {
  let release
  const holdProfile = new Promise((resolve) => { release = resolve })
  await mockAccount(page, { role: 'admin', holdProfile })
  await page.goto('/adminportal')
  await expect(page.getByRole('status')).toHaveText('Checking account access...')
  await expect(page.getByText('This is the Admin Portal !')).toHaveCount(0)
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.js')
    await supabase.auth.signOut({ scope: 'local' })
  })
  release()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Log In', exact: true })).toBeVisible()
  await expect(page.getByText('This is the Admin Portal !')).toHaveCount(0)
})
