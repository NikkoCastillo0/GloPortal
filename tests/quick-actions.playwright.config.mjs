import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  testDir: '.',
  testMatch: 'quick-actions.mjs',
  outputDir: '../test-results/gp182',
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:4192', channel: 'chrome', serviceWorkers: 'block' },
  webServer: {
    command: 'node scripts/preview-quick-actions.mjs',
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    url: 'http://127.0.0.1:4192/customerportal',
    reuseExistingServer: false,
    env: { RAYON_NUM_THREADS: '1' },
  },
  projects: [320, 390, 767, 768, 769, 1280].map(width => ({
    name: width + 'px',
    use: { viewport: { width, height: 900 } },
  })),
})
