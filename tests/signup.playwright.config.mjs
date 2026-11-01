import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  testDir: '.',
  testMatch: 'signup-validation.mjs',
  outputDir: '../test-results/gp93',
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:4176', channel: 'chrome', serviceWorkers: 'block' },
  webServer: {
    command: 'node scripts/preview-signup.mjs',
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    url: 'http://127.0.0.1:4176/__gp93/',
    reuseExistingServer: false,
    env: { RAYON_NUM_THREADS: '1' },
  },
  projects: [320, 390, 768, 1280].map(width => ({
    name: `${width}px`,
    use: { viewport: { width, height: 900 } },
  })),
})
