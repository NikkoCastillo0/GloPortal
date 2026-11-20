import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  testDir: '.',
  testMatch: 'customers.mjs',
  outputDir: '../test-results/gp268',
  workers: 1,
  use: { channel: 'chrome', baseURL: 'http://127.0.0.1:4184', serviceWorkers: 'block' },
  webServer: {
    command: 'node scripts/preview-customers.mjs',
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    url: 'http://127.0.0.1:4184/viewcustomers',
    reuseExistingServer: false,
    env: { RAYON_NUM_THREADS: '1' },
  },
  projects: [
    { name: 'mobile-small', use: { viewport: { width: 320, height: 568 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 900 } } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
  ],
})
