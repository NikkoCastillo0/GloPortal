import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  const errors = []
  const externalRequests = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('**/*', route => {
    if (new URL(route.request().url()).origin === 'http://127.0.0.1:4181') return route.continue()
    externalRequests.push(route.request().url())
    return route.abort()
  })
  page.gp263Checks = { errors, externalRequests }
})

test.afterEach(async ({ page }) => {
  expect(page.gp263Checks.errors).toEqual([])
  expect(page.gp263Checks.externalRequests).toEqual([])
})

test('overlay matches desktop and mobile Figma geometry and content', async ({ page }, testInfo) => {
  await page.goto('/__gp263/')
  await page.evaluate(() => document.fonts.ready)
  const dialog = page.getByRole('dialog', { name: 'Menu', exact: true })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('id', 'gp263-preview-menu')
  const nav = dialog.getByRole('navigation', { name: 'Admin navigation' })
  const rows = nav.getByRole('button')
  await expect(rows).toHaveText(['Dashboard', 'Appointments', 'Customers', 'Sign out'])
  await expect(dialog.getByRole('link')).toHaveCount(0)
  const box = await dialog.boundingBox()
  const { width, height } = page.viewportSize()
  expect(box.x + box.width).toBe(width < 768 ? width : width - 16)
  expect(box.y + box.height).toBeLessThanOrEqual(height)
  await expect(dialog).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  const title = dialog.getByRole('heading', { name: 'Menu', exact: true })
  const close = dialog.getByRole('button', { name: 'Close admin menu' })
  expect((await close.boundingBox()).width).toBe(47)
  expect((await close.boundingBox()).height).toBe(47)

  if (width < 768) {
    expect(box.width).toBe(Math.min(332, width))
    expect(box.height).toBe(height)
    expect(box.y).toBe(0)
    await expect(title).toHaveCSS('font-size', '34px')
    await expect(title).toHaveCSS('font-weight', '700')
    await expect(dialog).toHaveCSS('border-top-left-radius', '24px')
    await expect(dialog.getByText('Admin', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Garage Glo', { exact: true })).toBeVisible()
    const contact = dialog.getByText('Salinas, California', { exact: true }).locator('..')
    await expect(contact).toHaveCSS('height', '65px')
    if (width >= 332) expect((await contact.boundingBox()).y - box.y).toBe(388)
    for (const [index, row] of (await rows.all()).entries()) {
      const rowBox = await row.boundingBox()
      expect(rowBox.y - box.y).toBe(132 + index * 59)
      expect(rowBox.height).toBe(55)
      expect(rowBox.width).toBe(box.width - 48)
      await expect(row).toHaveCSS('font-size', '21px')
      const icons = row.locator('img')
      await expect(icons).toHaveCount(2)
      expect(await icons.first().evaluate(el => el.complete && el.naturalWidth === 20 && el.naturalHeight === 20)).toBe(true)
      expect((await icons.first().boundingBox()).width).toBe(20)
      expect(await icons.last().evaluate(el => el.complete && el.naturalWidth === 18 && el.naturalHeight === 18)).toBe(true)
      expect((await icons.last().boundingBox()).width).toBe(18)
    }
    await expect(rows.first()).toHaveCSS('background-color', 'rgb(236, 236, 234)')
  } else {
    expect(box.width).toBe(508)
    expect(box.height).toBe(472)
    expect(box.y).toBe(16)
    await expect(dialog).toHaveCSS('border-radius', '20px')
    await expect(title).toHaveCSS('font-size', '64px')
    await expect(title).toHaveCSS('font-weight', '600')
    expect((await title.boundingBox()).x - box.x).toBe(45)
    expect((await title.boundingBox()).y - box.y).toBe(13)
    expect((await close.boundingBox()).x - box.x).toBe(440)
    expect((await close.boundingBox()).y - box.y).toBe(13)
    await expect(dialog.getByText('Admin', { exact: true })).toBeHidden()
    await expect(dialog.getByText('Salinas, California')).toBeHidden()
    for (const [index, row] of (await rows.all()).entries()) {
      const rowBox = await row.boundingBox()
      expect(rowBox.y - box.y).toBe(131 + index * 75)
      expect(rowBox.x - box.x).toBe(index === 1 || index === 2 ? 44 : 45)
      expect(rowBox.height).toBe(58)
      await expect(row).toHaveCSS('font-size', '48px')
      await expect(row.locator('img').first()).toBeHidden()
    }
  }
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('admin-menu.png'), fullPage: false })
  await dialog.screenshot({ path: testInfo.outputPath('admin-menu-panel.png') })
})

test('visual controls do not implement other Jira tasks', async ({ page }) => {
  await page.goto('/__gp263/')
  const dialog = page.getByRole('dialog', { name: 'Menu', exact: true })
  const controls = dialog.getByRole('button')
  await expect(controls).toHaveCount(5)
  for (const button of await controls.all()) await expect(button).toBeDisabled()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeVisible()
  await expect(page).toHaveURL(/\/__gp263\/$/)
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
})

test('dialog shows visible focus and contains keyboard navigation', async ({ page }) => {
  await page.goto('/__gp263/')
  const dialog = page.getByRole('dialog', { name: 'Menu', exact: true })
  await expect(dialog).toBeFocused()
  await expect(dialog).toHaveCSS('outline-style', 'solid')
  await expect(dialog).toHaveCSS('outline-width', '2px')
  await expect(dialog).toHaveCSS('outline-offset', '-4px')
  await expect(dialog).toHaveCSS('outline-color', 'rgb(36, 36, 36)')

  await page.keyboard.press('Tab')
  await expect(dialog).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog).toBeFocused()
})

test('visibility is controlled externally and short screens can scroll', async ({ page }) => {
  await page.goto('/__gp263/?closed')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'GP-263 admin menu preview' })).toBeVisible()
  await page.setViewportSize({ width: page.viewportSize().width, height: 320 })
  await page.goto('/__gp263/')
  const dialog = page.getByRole('dialog', { name: 'Menu', exact: true })
  const last = dialog.getByRole('button', { name: 'Sign out', exact: true })
  await last.scrollIntoViewIfNeeded()
  await expect(last).toBeInViewport()
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  await expect(dialog).toHaveCSS('overflow-y', 'auto')
})
