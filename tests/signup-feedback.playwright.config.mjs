import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  testDir: '.',
  testMatch: 'signup-feedback.mjs',
  outputDir: '../test-results/gp91',
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:4177', channel: 'chrome', serviceWorkers: 'block' },
  webServer: {
    command: 'node scripts/preview-signup-feedback.mjs',
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    url: 'http://127.0.0.1:4177/__gp91/',
    reuseExistingServer: false,
    env: { RAYON_NUM_THREADS: '1' },
  },
  projects: [320, 390, 768, 1280].map(width => ({
    name: `${width}px`,
    use: { viewport: { width, height: 900 } },
  })),
})
