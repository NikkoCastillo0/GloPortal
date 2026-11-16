import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: 'route-access.gp87.mjs',
  outputDir: './test-results/gp87',
  use: { baseURL: 'http://127.0.0.1:4197' },
  webServer: {
    command: 'node scripts/preview-route-access.mjs',
    url: 'http://127.0.0.1:4197/login',
    reuseExistingServer: false,
    env: { RAYON_NUM_THREADS: '1' },
  },
  projects: [1280, 768, 390].map((width) => ({
    name: `${width}px`,
    use: { viewport: { width, height: 900 } },
  })),
})
