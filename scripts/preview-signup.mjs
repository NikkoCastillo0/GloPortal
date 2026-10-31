import { createServer } from 'vite'

const port = 4176
const origin = `http://127.0.0.1:${port}`
const entry = '\0gp93-preview'
const server = await createServer({
  envDir: false,
  cacheDir: 'node_modules/.vite-gp93-fixtures',
  optimizeDeps: {
    noDiscovery: true,
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'react-router-dom', 'lucide-react'],
  },
  server: { host: '127.0.0.1', port, strictPort: true, open: false },
  plugins: [{
    name: 'isolated-signup-preview',
    resolveId(id) { if (id === 'virtual:gp93-preview') return entry },
    load(id) {
      if (id !== entry) return
      return `import React from 'react';
        import { createRoot } from 'react-dom/client';
        import { MemoryRouter, Routes, Route } from 'react-router-dom';
        import '/src/index.css';
        import SignUp from '/src/pages/SignUp.jsx';
        const h = React.createElement;
        createRoot(document.getElementById('root')).render(
          h(MemoryRouter, { initialEntries: ['/signup'] }, h(Routes, null,
            h(Route, { path: '/signup', element: h(SignUp) }),
            h(Route, { path: '/customerportal', element: h('h1', null, 'Mock customer portal') }),
            h(Route, { path: '/login', element: h('h1', null, 'Mock Login page') })
          )));`
    },
    transform(code, id) {
      if (!id.replaceAll('\\', '/').endsWith('/src/lib/supabase.js')) return
      // Replace the entire service module before it loads. No SDK, credentials,
      // environment files, or remote requests are used by this fixture preview.
      return `const mock = window.__gp93Mock = {
          calls: [], scenario: new URLSearchParams(location.search).get('scenario') || 'confirmation', delay: 100
        };
        export const supabase = { auth: { signUp: async (payload) => {
          mock.calls.push(structuredClone(payload));
          await new Promise(resolve => setTimeout(resolve, mock.delay));
          if (mock.scenario === 'network') throw new Error('Synthetic connection failure');
          if (mock.scenario === 'failure' || mock.scenario === 'rate-limit') {
            return { data: {}, error: { code: mock.scenario === 'rate-limit'
              ? 'over_email_send_rate_limit' : 'synthetic_failure', message: 'Synthetic failure' } };
          }
          return { data: {
            session: mock.scenario === 'session' ? { access_token: 'synthetic-token' } : null,
            user: { id: 'synthetic-user', identities: mock.scenario === 'duplicate' ? [] : [{ id: 'synthetic-identity' }] }
          }, error: null };
        } } };`
    },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        if (new URL(req.url, origin).pathname !== '/__gp93/') return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Content-Security-Policy', `connect-src 'self' ws://127.0.0.1:${port}`)
        res.end(await vite.transformIndexHtml('/__gp93/', `<!doctype html><html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Local Sign Up validation preview</title></head><body>
          <aside style="padding:12px;background:#fff0b3;color:#111">Local Sign Up preview — simulated accounts only.</aside>
          <div id="root"></div><script type="module" src="/@id/virtual:gp93-preview"></script></body></html>`))
      })
    },
  }],
})
await server.listen()
console.log(`Local Sign Up preview (mock accounts only): ${origin}/__gp93/`)
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await server.close(); process.exit(0) })
}
