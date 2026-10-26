import { test, expect } from '@playwright/test'

test('existing users can open Login without submitting Sign Up or reloading', async ({ page }, testInfo) => {
  await page.route('**/*.supabase.co/**', (route) => route.abort())
  await page.goto('/signup')
  await expect(page.getByRole('heading', { name: 'Sign Up', exact: true })).toBeVisible()

  for (const [label, value] of [
    ['First Name', 'Test'],
    ['Last Name', 'User'],
    ['Email', 'test@example.com'],
    ['Phone Number', '5551234567'],
    ['Password', 'Test-only-123!'],
    ['Re-Enter Password', 'Test-only-123!'],
  ]) {
    await page.getByLabel(label, { exact: true }).fill(value)
    await expect(page.getByLabel(label, { exact: true })).toHaveValue(value)
  }

  await page.evaluate(() => {
    window.gp96DocumentToken = 'same-document'
    window.gp96Submits = 0
    document.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault()
      window.gp96Submits++
    })
  })

  const submit = page.getByRole('button', { name: 'Sign Up', exact: true })
  await submit.click()
  expect(await page.evaluate(() => window.gp96Submits)).toBe(1)

  const link = page.getByRole('link', { name: 'Log in', exact: true })
  await expect(link).toHaveAttribute('href', '/login')
  await submit.focus()
  await page.keyboard.press('Tab')
  await expect(link).toBeFocused()
  expect(await link.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('signup-login-link.png'), fullPage: true })

  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Log In', exact: true })).toBeVisible()
  expect(await page.evaluate(() => window.gp96DocumentToken)).toBe('same-document')
  expect(await page.evaluate(() => window.gp96Submits)).toBe(1)

  await page.goBack()
  await expect(page).toHaveURL(/\/signup$/)
  // An incomplete/invalid form must never block existing users from logging in.
  await page.getByLabel('Email', { exact: true }).fill('invalid-email')
  expect(await page.getByLabel('Email', { exact: true }).evaluate((el) => el.checkValidity())).toBe(false)
  await link.click()
  await expect(page).toHaveURL(/\/login$/)
  expect(await page.evaluate(() => window.gp96DocumentToken)).toBe('same-document')
})
