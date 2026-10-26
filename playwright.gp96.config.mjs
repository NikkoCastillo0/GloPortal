import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: 'signup-login-navigation.gp96.mjs',
  outputDir: './test-results/gp96',
  use: { baseURL: 'http://127.0.0.1:4196' },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4196 --strictPort --force',
    url: 'http://127.0.0.1:4196/signup',
    reuseExistingServer: false,
    env: { RAYON_NUM_THREADS: '1' },
  },
  projects: [1280, 768, 390].map((width) => ({
    name: `${width}px`,
    use: { viewport: { width, height: 900 } },
  })),
})
