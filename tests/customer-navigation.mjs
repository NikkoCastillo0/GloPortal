import { test, expect } from '@playwright/test'
import { customerNavigationItems } from '../src/config/customerNavigationItems.js'

const unavailable = ['View Next Appointment', 'My Vehicles', 'Add Vehicle', 'Edit Profile']
const allLabels = ['Customer Dashboard', 'View Next Appointment', 'My Vehicles', 'Book Appointment', 'Add Vehicle', 'Edit Profile']

async function openCustomerMenu(page, path = '/customerportal') {
  await page.goto(path)
  await expect(page.getByRole('heading', { name: 'Customer Dashboard', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Menu', exact: true })
  await expect(dialog).toBeVisible()
  return dialog
}

test.beforeEach(async ({ page }) => {
  const errors = []
  const externalRequests = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('**/*', route => {
    if (new URL(route.request().url()).origin === 'http://127.0.0.1:4189') return route.continue()
    externalRequests.push(route.request().url())
    return route.abort()
  })
  page.navigationChecks = { errors, externalRequests }
})

test.afterEach(async ({ page }) => {
  expect(page.navigationChecks.errors).toEqual([])
  expect(page.navigationChecks.externalRequests).toEqual([])
})

test('all six options and Sign out render with only the two confirmed destinations enabled', async ({ page }) => {
  const dialog = await openCustomerMenu(page)
  const nav = dialog.getByRole('navigation', { name: 'Customer navigation' })
  await expect(nav.locator(':scope > *')).toHaveCount(7)
  await expect(nav.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible()
  for (const [index, label] of allLabels.entries()) {
    await expect(nav.locator(':scope > *').nth(index)).toContainText(label)
  }
  await expect(nav.getByRole('link')).toHaveCount(2)
  await expect(nav.getByRole('link', { name: 'Customer Dashboard', exact: true })).toHaveAttribute('href', '/customerportal')
  await expect(nav.getByRole('link', { name: 'Customer Dashboard', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(nav.getByRole('link', { name: 'Book Appointment', exact: true })).toHaveAttribute('href', '/monthlybooking')
  await expect(nav.getByRole('link', { name: 'Book Appointment', exact: true })).not.toHaveAttribute('aria-current')
  await expect(nav.locator('[aria-disabled=true]')).toHaveCount(4)
  await expect(nav.getByText('Coming soon', { exact: true })).toHaveCount(4)
})

test('unavailable options cannot activate a destination or close the menu', async ({ page }) => {
  const dialog = await openCustomerMenu(page)
  const nav = dialog.getByRole('navigation', { name: 'Customer navigation' })
  for (const label of unavailable) {
    const row = nav.locator('[aria-disabled=true]').filter({ hasText: label })
    await expect(row).not.toHaveAttribute('href')
    await expect(row).not.toHaveAttribute('tabindex')
    await expect(row.locator('a, button, input, [tabindex]')).toHaveCount(0)
    // A physical click on the text must not navigate or act like an enabled link.
    await row.click()
    await expect(page).toHaveURL('http://127.0.0.1:4189/customerportal')
    await expect(dialog).toBeVisible()
  }
})

test('confirmed links use the real router, close the menu, and retain booking guest behavior', async ({ page }) => {
  let dialog = await openCustomerMenu(page, '/customerportal?entry=navigation-test')
  await dialog.getByRole('link', { name: 'Customer Dashboard', exact: true }).click()
  await expect(page).toHaveURL('http://127.0.0.1:4189/customerportal')
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Customer Dashboard', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  dialog = page.getByRole('dialog', { name: 'Menu', exact: true })
  await dialog.getByRole('link', { name: 'Book Appointment', exact: true }).click()
  await expect(page).toHaveURL('http://127.0.0.1:4189/monthlybooking')
  await expect(page.getByRole('heading', { name: 'Monthly Booking', exact: true })).toBeAttached()
  await expect(dialog).toHaveCount(0)
  await page.reload()
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Login', exact: true })).toHaveAttribute('href', '/login')
  await expect(page.getByRole('navigation', { name: 'Customer navigation' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Close menu', exact: true }).click()
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Customer Dashboard', exact: true })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('keyboard skips disabled items, traps focus, restores focus, and activates booking', async ({ page }) => {
  const dialog = await openCustomerMenu(page)
  const close = dialog.getByRole('button', { name: 'Close customer menu' })
  const dashboard = dialog.getByRole('link', { name: 'Customer Dashboard', exact: true })
  const booking = dialog.getByRole('link', { name: 'Book Appointment', exact: true })
  const signOut = dialog.getByRole('button', { name: 'Sign out', exact: true })
  await expect(close).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(dashboard).toBeFocused()
  await expect(dashboard).toHaveCSS('outline-style', 'solid')
  await expect(dashboard).toHaveCSS('outline-width', '2px')
  await page.keyboard.press('Tab')
  await expect(booking).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(signOut).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true })
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await page.keyboard.press('Enter')
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(signOut).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(booking).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('http://127.0.0.1:4189/monthlybooking')
  await expect(dialog).toHaveCount(0)
})

test('six options fit the original drawer width and remain reachable on short screens', async ({ page }, testInfo) => {
  const dialog = await openCustomerMenu(page)
  await page.evaluate(() => document.fonts.ready)
  const viewport = page.viewportSize()
  const box = await dialog.boundingBox()
  expect(box.width).toBe(viewport.width < 768 ? Math.min(332, viewport.width) : 288)
  expect(box.height).toBe(viewport.width < 768 ? viewport.height : 237)
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
  await expect(dialog).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await page.screenshot({ path: testInfo.outputPath('navigation-top.png') })
  for (const row of await dialog.getByRole('navigation', { name: 'Customer navigation' }).locator(':scope > *').all()) {
    await row.scrollIntoViewIfNeeded()
    await expect(row).toBeInViewport()
    expect(await row.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  }
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  await expect(dialog.getByRole('button', { name: 'Sign out', exact: true })).toBeInViewport()
  await page.screenshot({ path: testInfo.outputPath('navigation-bottom.png') })
  await page.setViewportSize({ width: viewport.width, height: 400 })
  const signOut = dialog.getByRole('button', { name: 'Sign out', exact: true })
  await signOut.scrollIntoViewIfNeeded()
  await expect(signOut).toBeInViewport()
  await dialog.getByRole('button', { name: 'Close customer menu' }).click()
  await expect(dialog).toHaveCount(0)
})

test('a destination can be enabled through configuration without changing menu markup', async ({ page }) => {
  // Exercise configurability using an existing route, never an invented page.
  const configuredItems = customerNavigationItems.map(item => (
    item.id === 'profile' ? { ...item, to: '/customerportal' } : item
  ))
  await page.route('**/src/config/customerNavigationItems.js*', route => route.fulfill({
    contentType: 'application/javascript',
    body: 'export const customerNavigationItems = ' + JSON.stringify(configuredItems),
  }))
  const dialog = await openCustomerMenu(page)
  const nav = dialog.getByRole('navigation', { name: 'Customer navigation' })
  await expect(nav.getByRole('link')).toHaveCount(3)
  await expect(nav.locator('[aria-disabled=true]')).toHaveCount(3)
  const profile = nav.getByRole('link', { name: 'Edit Profile', exact: true })
  await expect(profile).toHaveAttribute('href', '/customerportal')
  await profile.click()
  await expect(dialog).toHaveCount(0)
})

test('guest retains its existing menu, destinations, and dismissal', async ({ page }) => {
  await page.goto('/login')
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true })
  await trigger.click()
  await expect(page.getByRole('navigation', { name: 'Customer navigation' })).toHaveCount(0)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Login', exact: true })).toHaveAttribute('href', '/login')
  await expect(page.getByRole('link', { name: 'Sign Up', exact: true })).toHaveAttribute('href', '/signup')
  await page.getByRole('button', { name: 'Close menu', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Sign Up', exact: true })).toHaveCount(0)
  await trigger.click()
  await page.mouse.click(5, 300)
  await expect(page.getByRole('link', { name: 'Sign Up', exact: true })).toHaveCount(0)
  await trigger.click()
  await page.getByRole('link', { name: 'Sign Up', exact: true }).click()
  await expect(page).toHaveURL('http://127.0.0.1:4189/signup')
})

test('admin retains its dialog, dismissal, and existing sign-out cache clearing', async ({ page }, testInfo) => {
  await page.goto('/adminportal?role=admin')
  await expect(page.getByRole('heading', { name: 'Admin Dashboard', exact: true })).toBeAttached()
  await page.evaluate(() => {
    localStorage.setItem('navigation-check', 'admin')
    sessionStorage.setItem('navigation-check', 'admin')
  })
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true, includeHidden: true })
  await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
  const dialog = page.getByRole('dialog', { name: 'Menu', exact: true })
  for (const method of ['button', 'escape', 'backdrop']) {
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(dialog).toHaveAttribute('id', await trigger.getAttribute('aria-controls'))
    await expect(dialog.getByRole('navigation', { name: 'Admin navigation' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Customer navigation' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Login', exact: true })).toHaveCount(0)
    const close = dialog.getByRole('button', { name: 'Close admin menu' })
    await expect(close).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(dialog.getByRole('button', { name: 'Sign out', exact: true })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(close).toBeFocused()
    if (method === 'button') await close.click()
    if (method === 'escape') await page.keyboard.press('Escape')
    if (method === 'backdrop') {
      // Expose the backdrop when the 320px drawer fills the viewport.
      if (page.viewportSize().width < 332) await page.setViewportSize({ width: 390, height: 844 })
      await page.mouse.click(5, 300)
    }
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  }
  await trigger.click()
  await page.screenshot({ path: testInfo.outputPath('admin-menu.png') })
  await dialog.getByRole('button', { name: 'Sign out', exact: true }).click()
  await expect(page).toHaveURL('http://127.0.0.1:4189/')
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0])
  await expect(dialog).toHaveCount(0)
})

test('customer Sign out preserves existing cache behavior and ends simulated access', async ({ page }) => {
  const dialog = await openCustomerMenu(page)
  await page.evaluate(() => {
    localStorage.setItem('navigation-check', 'customer')
    sessionStorage.setItem('navigation-check', 'customer')
  })
  await dialog.getByRole('button', { name: 'Sign out', exact: true }).click()
  await expect(page).toHaveURL('http://127.0.0.1:4189/')
  await expect(dialog).toHaveCount(0)
  expect(await page.evaluate(() => [localStorage.getItem('navigation-check'), sessionStorage.getItem('navigation-check')])).toEqual(['customer', 'customer'])
  // SPA navigation retains the local service fixture's signed-out state.
  await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.js')
    const { data } = await supabase.auth.getUser()
    if (data.user !== null) throw new Error('Simulated customer remains signed in')
  })
})

test('loading customer Header shows navigation and Sign out together', async ({ page }) => {
  await page.goto('/customerportal?access=loading')
  await expect(page.getByText('Verifying account access...', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Menu', exact: true })
  const nav = dialog.getByRole('navigation', { name: 'Customer navigation' })
  await expect(nav.getByRole('link')).toHaveCount(2)
  await expect(nav.locator('[aria-disabled=true]')).toHaveCount(4)
  await expect(nav.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeFocused()
})

test('existing customer access checks still redirect or deny simulated noncustomers', async ({ page }) => {
  await page.goto('/customerportal?access=signed-out')
  await expect(page).toHaveURL('http://127.0.0.1:4189/login')
  await page.goto('/customerportal?access=denied')
  await expect(page.getByRole('heading', { name: 'Access Denied', exact: true })).toBeVisible()
  await page.goto('/customerportal?role=admin')
  await expect(page).toHaveURL('http://127.0.0.1:4189/adminportal')
})
