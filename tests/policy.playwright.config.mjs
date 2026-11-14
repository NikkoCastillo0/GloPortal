import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const baseURL = 'http://127.0.0.1:4185'

export default defineConfig({
  testDir: '.',
  testMatch: 'policy.mjs',
  outputDir: '../test-results/gp265',
  workers: 1,
  use: { baseURL },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4185 --strictPort',
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    url: `${baseURL}/privacy-policy`,
    reuseExistingServer: false,
    env: {
      VITE_SUPABASE_URL: 'https://policy-test.invalid',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'policy-test-key',
      RAYON_NUM_THREADS: '1',
    },
  },
  projects: [320, 390, 1280].map(width => ({
    name: `${width}px`,
    use: { viewport: { width, height: 800 } },
  })),
})
