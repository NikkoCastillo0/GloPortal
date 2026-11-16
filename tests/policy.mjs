import { expect, test } from '@playwright/test'

const policies = [
  {
    path: '/privacy-policy',
    title: 'Privacy Policy',
    headings: [
      'Information we collect and why',
      'Supabase and other service providers',
      'Security and possible data loss',
      'Retention and deletion requests',
      'Customer privacy rights',
      'Children’s privacy and minimum age',
      'Policy updates and contact',
    ],
  },
  {
    path: '/terms-of-service',
    title: 'Terms of Service',
    headings: [
      'Account responsibilities',
      'Appointment requests and confirmations',
      'Cancellations and rescheduling',
      'Acceptable website use',
      'Garage Glo content and ownership',
      'Website availability and third-party interruptions',
      'Limitations of liability',
    ],
  },
]

for (const { path, title, headings } of policies) {
  test(`${title} renders and supports keyboard reading`, async ({ page, baseURL }) => {
    const externalRequests = []
    await page.route('**/*', route => {
      const url = route.request().url()
      if (new URL(url).origin === baseURL) return route.continue()
      externalRequests.push(url)
      return route.abort()
    })

    const response = await page.goto(path)
    expect(response.ok()).toBe(true)
    await expect(page).toHaveTitle(`${title} | Garage Glo`)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
    const main = page.getByRole('main')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
    await expect(main.getByRole('heading', { level: 2 })).toHaveText(headings)
    await expect(main.getByText('Draft for review', { exact: true })).toBeVisible()
    await expect(main.getByText('Adrian and the project team', { exact: false })).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(page.viewportSize().width)

    const skip = page.getByRole('link', { name: 'Skip to policy content' })
    await page.keyboard.press('Tab')
    await expect(skip).toBeFocused()
    await expect(skip).toBeInViewport()
    await page.keyboard.press('Enter')
    await expect(main).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(main.getByRole('link').first()).toBeFocused()
    await expect(main.getByRole('link', { name: 'Garagegloauto@gmail.com' }))
      .toHaveAttribute('href', 'mailto:Garagegloauto@gmail.com')
    expect(externalRequests).toEqual([])
  })
}
