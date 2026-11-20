import assert from 'node:assert/strict'
import { mkdir, realpath } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { chromium, expect } from '@playwright/test'
import { createServer } from 'vite'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const artifactDir = path.join(projectRoot, 'test-results', 'inventory-forms')
const records = [
  ['valve-stem', 'Valve Stem', '17', '2026-09-09', 'https://www.amazon.com/dp/B01LOK7BPQ'],
  ['valve-stem-core', 'Valve Stem Core', '14', '2026-09-09', 'https://www.fleetpride.com/parts/haltec-tire-repair-supplies-a100vc1'],
  ['blue-wheel-tape', 'Blue Wheel Tape', '5', '2026-08-21', 'https://www.amazon.com/dp/B0F9T2QVQQ'],
  ['tpms-sensor', 'TPMS Sensor', '3', '2026-08-21', 'https://store.bartecusa.com/rite-sensor'],
]

async function expectNoOverflow(page, width) {
  const geometry = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    clippedControls: [...document.querySelectorAll('main input, main button, main a')]
      .filter((element) => element.getClientRects().length)
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        return rect.left < -1 || rect.right > innerWidth + 1
      }).length,
  }))
  assert.equal(geometry.width, width)
  assert.equal(geometry.clippedControls, 0)
}

test('Inventory forms and listing navigation', { timeout: 180000 }, async (t) => {
  await mkdir(artifactDir, { recursive: true })
  const server = await createServer({
    root: projectRoot,
    logLevel: 'error',
    cacheDir: path.join(artifactDir, 'vite-cache'),
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('http://127.0.0.1:1/unused-auth'),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('local-inventory-ui-test'),
    },
    server: {
      host: '127.0.0.1',
      port: 0,
      fs: { allow: [projectRoot, await realpath(path.join(projectRoot, 'node_modules'))] },
    },
  })
  let browser

  try {
    await server.listen()
    const origin = server.resolvedUrls.local[0].replace(/\/$/, '')
    browser = await chromium.launch({ headless: true, channel: process.env.GP306_BROWSER_CHANNEL || undefined })
    const context = await browser.newContext()
    const externalRequests = []
    const errors = []
    await context.route('**/*', (route) => {
      if (new URL(route.request().url()).origin === origin) return route.continue()
      externalRequests.push(route.request().url())
      return route.abort()
    })
    const page = await context.newPage()
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    const name = page.getByLabel('Item Name', { exact: true })
    const amount = page.getByRole('spinbutton', { name: 'Amount', exact: true })
    const restock = page.getByLabel('Last Restock', { exact: true })
    const purchase = page.getByLabel('Purchase Link', { exact: true })

    for (const width of [320, 390, 768, 1024, 1280, 1728]) {
      await t.test(`Add and all four Edit forms at ${width}px`, async () => {
        await page.setViewportSize({ width, height: 1000 })
        await page.goto(`${origin}/viewinventory`)
        const addLink = page.getByRole('link', { name: 'Add Item', exact: true })
        await addLink.focus()
        await addLink.press('Enter')
        await expect(page).toHaveURL(`${origin}/addinventoryitem`)
        await expect(page.getByRole('heading', { name: 'Add inventory item', exact: true })).toBeVisible()
        for (const input of [name, amount, restock, purchase]) await expect(input).toHaveValue('')
        await page.evaluate(() => document.fonts.ready)
        await expectNoOverflow(page, width)
        if ([390, 1280].includes(width)) {
          await page.screenshot({ path: path.join(artifactDir, `add-${width}.png`), fullPage: true })
        }

        await name.fill('LongInventoryName'.repeat(20))
        await name.press('Tab')
        await expect(amount).toBeFocused()
        await amount.pressSequentially('23')
        await expect(amount).toHaveValue('23')
        await restock.fill('2026-11-18')
        await purchase.fill(`https://example.com/${'long-path'.repeat(30)}`)
        await expectNoOverflow(page, width)
        await page.getByRole('button', { name: 'Add item', exact: true }).focus()
        await page.keyboard.press('Enter')
        await expect(page.getByRole('status')).toHaveText('This is a preview. No inventory changes have been saved.')
        await expect(page).toHaveURL(`${origin}/addinventoryitem`)
        await page.reload()
        for (const input of [name, amount, restock, purchase]) await expect(input).toHaveValue('')
        await page.getByRole('button', { name: 'Cancel', exact: true }).focus()
        await page.keyboard.press('Enter')
        await expect(page).toHaveURL(`${origin}/viewinventory`)

        for (const [index, [id, itemName, quantity, date, url]] of records.entries()) {
          const editLink = page.getByRole('link', { name: `Edit ${itemName}`, exact: true })
          await editLink.focus()
          await editLink.press('Enter')
          await expect(page).toHaveURL(`${origin}/editinventoryitem?id=${id}`)
          await expect(page.getByRole('heading', { name: 'Edit inventory item', exact: true })).toBeVisible()
          await expect(name).toHaveValue(itemName)
          await expect(amount).toHaveValue(quantity)
          await expect(restock).toHaveValue(date)
          await expect(purchase).toHaveValue(url)
          await expectNoOverflow(page, width)
          if (index === 0 && [390, 1280].includes(width)) {
            await page.screenshot({ path: path.join(artifactDir, `edit-${width}.png`), fullPage: true })
          }

          await amount.fill('-1')
          assert.equal(await amount.evaluate((input) => input.validity.rangeUnderflow), true)
          await page.getByRole('button', { name: 'Save changes', exact: true }).click()
          await expect(page.getByRole('status')).toHaveCount(0)
          await amount.fill('2.5')
          assert.equal(await amount.evaluate((input) => input.validity.stepMismatch), true)
          await amount.fill('')
          await amount.pressSequentially('42')
          await expect(amount).toHaveValue('42')
          await name.fill(`Updated ${itemName}`)
          await restock.fill('2026-11-18')
          await purchase.fill('invalid-url')
          assert.equal(await purchase.evaluate((input) => input.validity.typeMismatch), true)
          await page.getByRole('button', { name: 'Save changes', exact: true }).click()
          await expect(page.getByRole('status')).toHaveCount(0)
          await purchase.fill('https://example.com/item')
          await page.getByRole('button', { name: 'Save changes', exact: true }).focus()
          await page.keyboard.press('Enter')
          await expect(page.getByRole('status')).toHaveText('This is a preview. No inventory changes have been saved.')
          await expect(page).toHaveURL(`${origin}/editinventoryitem?id=${id}`)
          await page.reload()
          await expect(name).toHaveValue(itemName)
          await expect(amount).toHaveValue(quantity)
          await expect(restock).toHaveValue(date)
          await expect(purchase).toHaveValue(url)
          await page.getByRole('button', { name: 'Cancel', exact: true }).click()
          await expect(page.getByRole('spinbutton', { name: `Amount for ${itemName}`, exact: true })).toHaveValue(quantity)
        }
      })
    }

    await t.test('Missing or invalid item IDs offer a safe return to Inventory', async () => {
      for (const suffix of ['', '?id=unknown', '?id=%3Cscript%3E']) {
        await page.goto(`${origin}/editinventoryitem${suffix}`)
        await expect(page.getByRole('alert')).toContainText('Inventory item not found.')
        await expect(page.getByRole('form')).toHaveCount(0)
        await page.getByRole('link', { name: 'Back to Inventory' }).click()
        await expect(page).toHaveURL(`${origin}/viewinventory`)
      }
    })

    assert.deepEqual(errors, [])
    assert.deepEqual(externalRequests, [])
    assert.equal(await page.evaluate(() => localStorage.length), 0)
  } finally {
    await browser?.close()
    await server.close()
  }
})
