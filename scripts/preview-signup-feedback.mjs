import { createServer } from 'vite'

const port = 4177
const origin = `http://127.0.0.1:${port}`
const entry = '\0gp91-preview'
const server = await createServer({
  envDir: false,
  cacheDir: 'node_modules/.vite-gp91-fixtures',
  optimizeDeps: {
    noDiscovery: true,
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'react-router-dom', 'lucide-react'],
  },
  server: { host: '127.0.0.1', port, strictPort: true, open: false },
  plugins: [{
    name: 'isolated-signup-feedback-preview',
    resolveId(id) { if (id === 'virtual:gp91-preview') return entry },
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
      // Replace the service before it loads; no SDK, credentials, or remote API.
      return `const mock = window.__gp91Mock = {
          calls: [], scenario: new URLSearchParams(location.search).get('scenario') || 'confirmation', delay: 100
        };
        export const supabase = { auth: { signUp: async payload => {
          mock.calls.push(structuredClone(payload));
          await new Promise(resolve => setTimeout(resolve, mock.delay));
          const scenario = mock.scenario;
          if (scenario === 'throw-null') throw null;
          if (scenario === 'throw-string') throw 'PRIVATE DIAGNOSTIC';
          if (scenario === 'throw-number') throw 42;
          if (scenario === 'throw-object') throw { message: {}, code: {} };
          if (scenario === 'throw-error') throw new Error('PRIVATE DIAGNOSTIC');
          if (scenario === 'network') throw Object.assign(new Error('Synthetic connection failure'), { name: 'AuthRetryableFetchError', status: 0 });
          const codes = { 'duplicate-code': 'user_already_exists', 'email-exists': 'email_exists',
            'email-limit': 'over_email_send_rate_limit', 'request-limit': 'over_request_rate_limit',
            'weak-password': 'weak_password', failure: 'unexpected_failure' };
          if (Object.hasOwn(codes, scenario)) return { data: null, error: { code: codes[scenario], message: 'PRIVATE DIAGNOSTIC' } };
          if (scenario === 'legacy-email-limit') return { data: null, error: { message: 'Email rate limit exceeded' } };
          if (scenario === 'http-limit') return { data: null, error: { status: 429 } };
          if (scenario === 'malformed-null') return null;
          if (scenario === 'malformed-empty') return {};
          if (scenario === 'missing-user') return { data: { user: null, session: null }, error: null };
          if (scenario === 'missing-user-id') return { data: { user: {}, session: null }, error: null };
          if (scenario === 'missing-error') return { data: { user: { id: 'synthetic-user' }, session: null } };
          if (scenario === 'malformed-session') return { data: { user: { id: 'synthetic-user' }, session: {} }, error: null };
          return { data: {
            user: { id: 'synthetic-user', identities: scenario === 'duplicate' ? [] : [{ id: 'synthetic-identity' }] },
            session: scenario === 'session' ? { access_token: 'synthetic-token' } : null
          }, error: null };
        } } };`
    },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        if (new URL(req.url, origin).pathname !== '/__gp91/') return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Content-Security-Policy', `connect-src 'self' ws://127.0.0.1:${port}`)
        res.end(await vite.transformIndexHtml('/__gp91/', `<!doctype html><html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Local Sign Up feedback preview</title></head><body>
          <aside style="padding:12px;background:#fff0b3;color:#111">Local Sign Up feedback preview — simulated accounts only.</aside>
          <div id="root"></div><script type="module" src="/@id/virtual:gp91-preview"></script></body></html>`))
      })
    },
  }],
})
await server.listen()
console.log(`Local Sign Up feedback preview (mock accounts only): ${origin}/__gp91/`)
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await server.close(); process.exit(0) })
}
