import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  use: { baseURL: 'http://127.0.0.1:4175' },
  webServer: {
    command: 'node scripts/preview-appointments.mjs --test',
    url: 'http://127.0.0.1:4175/__gp24/',
    // Always test this checkout's fixture server, never an older/manual/live preview.
    reuseExistingServer: false,
    // One Playwright worker should not launch a large native bundler thread pool.
    env: { RAYON_NUM_THREADS: '1' },
  },
  projects: [1280, 768, 390].map((width) => ({
    name: `${width}px`,
    use: { viewport: { width, height: 900 } },
  })),
})
