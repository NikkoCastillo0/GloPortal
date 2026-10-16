import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  use: { baseURL: 'http://127.0.0.1:4174' },
  webServer: {
    command: 'node scripts/preview-appointments.mjs',
    url: 'http://127.0.0.1:4174/__gp24/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [1280, 768, 390].map((width) => ({
    name: `${width}px`,
    use: { viewport: { width, height: 900 } },
  })),
})
