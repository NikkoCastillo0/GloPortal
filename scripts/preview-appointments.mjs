import { createServer } from 'vite'
import { queryFixtures } from './appointment-fixtures.mjs'

const isTest = process.argv.includes('--test')
const port = isTest ? 4175 : Number(process.env.GP24_PREVIEW_PORT || 4174)
const origin = `http://127.0.0.1:${port}`
const live = process.argv.includes('--live')
const entry = '\0gp24-preview'
const server = await createServer({
  // Different Vite configurations must not invalidate each other's optimizer files.
  cacheDir: `node_modules/.vite-gp24-${isTest ? 'test' : live ? 'live' : 'fixtures'}`,
  // Optimize the virtual entry's dependencies, not the unrelated homepage in index.html.
  optimizeDeps: {
    noDiscovery: true,
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'lucide-react', '@supabase/supabase-js'],
  },
  server: { host: '127.0.0.1', port, strictPort: true, open: false },
  ...(!live && { define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(`${origin}/__gp24-api`),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('gp24-synthetic-fixture-key'),
  } }),
  plugins: [{
    name: 'isolated-gp24-preview',
    resolveId(id) { if (id === 'virtual:gp24-preview') return entry },
    load(id) {
      if (id !== entry) return
      return `import React from 'react';
        import { createRoot } from 'react-dom/client';
        import '/src/index.css';
        import ViewAppointments from '/src/pages/ViewAppointments.jsx';
        createRoot(document.getElementById('root')).render(React.createElement(ViewAppointments));`
    },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, origin)
        if (url.pathname === '/__gp24/') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(await vite.transformIndexHtml(url.pathname, `<!doctype html><html><head>
            <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>GP-24 isolated preview</title></head><body>
            <aside style="padding:12px;background:#fff0b3;color:#111">${live ? 'LIVE DATA PREVIEW — requires an authenticated Supabase session and applied migration.' : 'SYNTHETIC TEST FIXTURES — not live Supabase data.'}</aside>
            <div id="root"></div><script type="module" src="/@id/virtual:gp24-preview"></script></body></html>`))
          return
        }
        if (!live && url.pathname === '/__gp24-api/rest/v1/appointment_filter_records') {
          const state = new URL(req.headers.referer || origin).searchParams.get('state')
          res.setHeader('Content-Type', 'application/json')
          if (state === 'loading') return // Deliberately pending for loading-state inspection.
          if (state === 'error') {
            res.statusCode = 500
            res.end(JSON.stringify({ message: 'Synthetic fixture failure' }))
            return
          }
          const result = queryFixtures(url.searchParams)
          const rows = state === 'empty' ? [] : result.rows
          const count = state === 'empty' ? 0 : result.count
          res.setHeader('Content-Range', `${result.offset}-${result.offset + rows.length - 1}/${count}`)
          res.end(JSON.stringify(rows))
          return
        }
        next()
      })
    },
  }],
})
await server.listen()
console.log(`GP-24 ${live ? 'live' : 'fixture'} preview: ${origin}/__gp24/`)
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await server.close(); process.exit(0) })
}
