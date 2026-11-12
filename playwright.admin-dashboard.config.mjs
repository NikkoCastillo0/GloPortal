import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: 'admin-dashboard*.browser.mjs',
  outputDir: './test-results/admin-dashboard',
  use: { baseURL: 'http://127.0.0.1:4178' },
  webServer: {
    command: 'node scripts/preview-admin-dashboard.mjs --test',
    url: 'http://127.0.0.1:4178/__admin-preview/',
    reuseExistingServer: false,
    env: { RAYON_NUM_THREADS: '1' },
  },
  projects: [320, 390, 768, 1440].map((width) => ({
    name: `${width}px`,
    use: { viewport: { width, height: 900 } },
  })),
})
