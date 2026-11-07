import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  testDir: '.',
  testMatch: 'customer-menu.spec.mjs',
  outputDir: '../test-results/gp160',
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:4180', channel: 'chrome', serviceWorkers: 'block' },
  webServer: {
    command: 'node scripts/preview-customer-menu.mjs',
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    url: 'http://127.0.0.1:4180/__gp160/',
    reuseExistingServer: false,
    env: { RAYON_NUM_THREADS: '1' },
  },
  projects: [
    { name: 'mobile-small', use: { viewport: { width: 320, height: 568 } } },
    { name: 'mobile-figma', use: { viewport: { width: 390, height: 844 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 900 } } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
  ],
})
