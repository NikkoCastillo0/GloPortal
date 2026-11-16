import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  testDir: '.',
  testMatch: 'recent-activity.mjs',
  outputDir: process.env.GP183_APP_ROOT ? '../test-results/gp183-develop' : '../test-results/gp183',
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:4193', channel: 'chrome', serviceWorkers: 'block' },
  webServer: {
    command: 'node scripts/preview-recent-activity.mjs',
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    url: 'http://127.0.0.1:4193/customerportal',
    reuseExistingServer: false,
    env: { RAYON_NUM_THREADS: '1' },
  },
  projects: [320, 390, 768, 1280].map(width => ({
    name: width + 'px',
    use: { viewport: { width, height: 900 } },
  })),
})
