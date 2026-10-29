import { createServer } from 'vite'

// GP-87 tests use synthetic credentials and intercept this local API in Playwright.
const server = await createServer({
  cacheDir: 'node_modules/.vite-gp87',
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('http://127.0.0.1:4197/__gp87-api'),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('gp87-synthetic-key'),
  },
  server: { host: '127.0.0.1', port: 4197, strictPort: true },
})
await server.listen()
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await server.close(); process.exit(0) })
}
