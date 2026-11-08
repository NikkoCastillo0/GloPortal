import { test, expect } from '@playwright/test'

async function getCardMetrics(panel) {
  return panel.evaluate(el => {
    const box = el.getBoundingClientRect()
    const style = getComputedStyle(el)
    return {
      x: box.x, y: box.y, width: box.width, height: box.height,
      padding: style.padding, radius: style.borderRadius, shadow: style.boxShadow,
    }
  })
}

test.beforeEach(async ({ page }) => {
  const errors = []
  const externalRequests = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('**/*', route => {
    if (new URL(route.request().url()).origin === 'http://127.0.0.1:4180') return route.continue()
    externalRequests.push(route.request().url())
    return route.abort()
  })
  page.gp160Checks = { errors, externalRequests }
})

test.afterEach(async ({ page }) => {
  expect(page.gp160Checks.errors).toEqual([])
  expect(page.gp160Checks.externalRequests).toEqual([])
})

test('customer header opens the responsive container with supplied content', async ({ page }, testInfo) => {
  await page.goto('/__gp160/')
  await page.evaluate(() => document.fonts.ready)
  // Base UI hides the background from assistive technology while modal.
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true, includeHidden: true })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Menu', exact: true })
  await expect(dialog).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  expect(await trigger.getAttribute('aria-controls')).toBe(await dialog.getAttribute('id'))
  await expect(dialog.getByRole('navigation', { name: 'Customer navigation' })).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '#preview-dashboard')
  await expect(dialog.getByRole('link', { name: 'Login', exact: true })).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: 'Close customer menu' })).toBeFocused()
  const box = await dialog.boundingBox()
  const customerCardMetrics = await getCardMetrics(dialog)
  const { width, height } = page.viewportSize()
  expect(box.x + box.width).toBeLessThanOrEqual(width)
  expect(box.y + box.height).toBeLessThanOrEqual(height)
  await expect(dialog).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  if (width < 768) {
    expect(box.width).toBe(Math.min(332, width))
    expect(box.height).toBe(height)
    expect(box.y).toBe(0)
    await expect(dialog.getByText('Customer', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Salinas, California')).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Menu' })).toHaveCSS('font-size', '34px')
  } else {
    expect(box.width).toBe(288)
    expect(box.height).toBe(237)
    expect(box.x).toBe(width - 304)
    expect(box.y).toBe(16)
    await expect(dialog.getByText('Customer', { exact: true })).toBeHidden()
    await expect(dialog.getByText('Salinas, California')).toBeHidden()
    await expect(dialog.getByRole('heading', { name: 'Menu' })).toHaveCSS('font-size', '20px')
    const rows = dialog.getByRole('navigation', { name: 'Customer navigation' }).locator(':scope > a, :scope > button')
    await expect(rows).toHaveCount(4)
    for (const [index, row] of (await rows.all()).entries()) {
      const rowBox = await row.boundingBox()
      // Four readable rows fit in the same desktop card as the guest menu.
      expect(rowBox.y - box.y).toBe(101 + index * 28)
      expect(rowBox.height).toBe(28)
      await expect(row).toHaveCSS('font-size', '18px')
      await expect(row).toHaveCSS('font-weight', '600')
      expect(await row.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    }
    expect(await dialog.evaluate(el => el.scrollHeight <= el.clientHeight)).toBe(true)
  }
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('customer-menu.png'), fullPage: false })
  await dialog.getByRole('link', { name: 'Dashboard' }).click()
  await expect(page).toHaveURL(/#preview-dashboard$/)
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Close customer menu' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  if (width >= 768) {
    await page.goto('/__gp160/?mode=guest')
    await page.evaluate(() => document.fonts.ready)
    await page.getByRole('button', { name: 'Open menu', exact: true }).click()
    const guestCard = page.getByRole('heading', { name: 'Menu', exact: true }).locator('../..')
    expect(customerCardMetrics).toEqual(await getCardMetrics(guestCard))
  }
})

test('controlled callbacks support close button, Escape, backdrop, and reopening', async ({ page }) => {
  await page.goto('/__gp160/?mode=controlled&custom')
  const trigger = page.getByRole('button', { name: 'Open controlled menu' })
  const dialog = page.getByRole('dialog', { name: 'Menu', exact: true })
  for (const [index, method] of ['button', 'escape', 'backdrop'].entries()) {
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(dialog.getByRole('link')).toHaveCount(1)
    await expect(dialog.getByRole('link')).toHaveText('Custom destination')
    if (method === 'button') await dialog.getByRole('button', { name: 'Close customer menu' }).click()
    if (method === 'escape') await page.keyboard.press('Escape')
    // At 320px the drawer fills the viewport, so expose a backdrop for this check.
    if (method === 'backdrop') {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.mouse.click(10, 200)
    }
    await expect(dialog).toHaveCount(0)
    await expect(page.getByRole('status')).toContainText('Close requests: ' + (index + 1))
    await expect(trigger).toBeFocused()
  }
})

test('parent retains control when it declines a close request', async ({ page }) => {
  await page.goto('/__gp160/?mode=controlled&hold-open')
  await page.getByRole('button', { name: 'Open controlled menu' }).click()
  const dialog = page.getByRole('dialog', { name: 'Menu', exact: true })
  await dialog.getByRole('button', { name: 'Close customer menu' }).click()
  await expect(dialog).toBeVisible()
  // The status is intentionally outside the modal's accessible subtree.
  await expect(page.locator('[role=status]')).toContainText('Close requests: 1')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeVisible()
  await expect(page.locator('[role=status]')).toContainText('Close requests: 2')
})

test('focus stays inside the modal and background scrolling is locked', async ({ page }) => {
  await page.goto('/__gp160/?mode=controlled')
  const unlockedStyles = await page.evaluate(() => [
    document.documentElement.style.overflowY,
    document.body.style.overflowY,
    document.body.style.height,
  ])
  const trigger = page.getByRole('button', { name: 'Open controlled menu' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Menu', exact: true })
  const close = dialog.getByRole('button', { name: 'Close customer menu' })
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Sign out' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  const scrollBefore = await page.evaluate(() => window.scrollY)
  await page.mouse.move(5, 200)
  await page.mouse.wheel(0, 600)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollBefore)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  // Scroll lock releases asynchronously; wait for cleanup before sending a wheel event.
  await expect.poll(() => page.evaluate(() => [
    document.documentElement.style.overflowY,
    document.body.style.overflowY,
    document.body.style.height,
  ])).toEqual(unlockedStyles)
  await page.mouse.move(page.viewportSize().width / 2, 300)
  await page.mouse.wheel(0, 600)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBefore)
})

test('long content remains reachable on short screens without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: page.viewportSize().width, height: 400 })
  await page.goto('/__gp160/?mode=controlled&long')
  await page.getByRole('button', { name: 'Open controlled menu' }).click()
  const dialog = page.getByRole('dialog', { name: 'Menu', exact: true })
  await dialog.getByRole('link', { name: 'Extra option 16', exact: true }).scrollIntoViewIfNeeded()
  await expect(dialog.getByRole('link', { name: 'Extra option 16', exact: true })).toBeInViewport()
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  const close = dialog.getByRole('button', { name: 'Close customer menu' })
  await close.scrollIntoViewIfNeeded()
  await close.click()
  await expect(dialog).toHaveCount(0)
})

for (const mode of ['guest', 'admin']) {
  test(mode + ' header preserves its existing menu and dismissal behavior', async ({ page }) => {
    await page.goto('/__gp160/?mode=' + mode)
    const trigger = page.getByRole('button', { name: 'Open menu', exact: true })
    await trigger.click()
    await expect(page.getByRole('link', { name: 'Login', exact: true })).toHaveAttribute('href', '/login')
    await expect(page.getByRole('link', { name: 'Sign Up', exact: true })).toHaveAttribute('href', '/signup')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('navigation', { name: 'Customer navigation' })).toHaveCount(0)
    if (page.viewportSize().width < 768) {
      await expect(page.getByRole('link', { name: 'Services', exact: true })).toBeVisible()
    }
    await page.getByRole('button', { name: 'Close menu', exact: true }).click()
    await expect(page.getByRole('link', { name: 'Login', exact: true })).toHaveCount(0)
    await trigger.click()
    await page.mouse.click(5, 300)
    await expect(page.getByRole('link', { name: 'Login', exact: true })).toHaveCount(0)
  })
}
