import { createServer } from 'vite'

const port = 4186
const origin = 'http://127.0.0.1:' + port
const entry = '\0gp266-footer-preview'

// This server previews the real routes with local service fixtures only.
// It never loads environment files or connects to Supabase or EmailJS.
const serviceFixture = `
  const params = new URLSearchParams(location.search);
  const access = params.get('access') || 'authorized';
  const role = params.get('role') || 'customer';
  const empty = { data: [], count: 0, error: null };
  export const supabase = {
    auth: {
      getUser: async () => {
        if (access === 'loading') return new Promise(() => {});
        return { data: { user: access === 'denied' ? null : { id: 'footer-preview-user' } }, error: null };
      },
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Sign-in is disabled in the footer preview.' } }),
      signUp: async () => ({ data: null, error: { message: 'Sign-up is disabled in the footer preview.' } }),
    },
    from: () => ({
      select() { return this; }, eq() { return this; }, order() { return this; },
      or() { return this; }, gte() { return this; }, lt() { return this; },
      single: async () => ({ data: { role }, error: null }),
      range: async () => empty,
      then(resolve, reject) { return Promise.resolve(empty).then(resolve, reject); },
    }),
    rpc: async () => empty,
  };
`

const footerFixture = `
  import React from 'react';
  import { createRoot } from 'react-dom/client';
  import { MemoryRouter } from 'react-router-dom';
  import Footer from '/src/components/layout/Footer.jsx';
  import { footerPolicyLinks } from '/src/config/footerPolicyLinks.js';
  import '/src/index.css';
  const h = React.createElement;
  const mode = new URLSearchParams(location.search).get('links');
  const policyLinks = footerPolicyLinks.map((policy, index) => ({
    ...policy,
    href: mode === 'all' || (mode === 'partial' && index === 0)
      ? '/__gp266/destination/' + policy.id : null,
  }));
  const isDestination = location.pathname.startsWith('/__gp266/destination/');
  createRoot(document.getElementById('root')).render(
    h(MemoryRouter, null, h('div', { className: 'flex min-h-svh flex-col' },
      h('main', { className: 'flex-1 p-6' },
        h('h1', { className: 'text-2xl font-semibold' },
          isDestination ? 'Configured test destination' : 'Footer preview'),
        h('p', { className: 'mt-3' }, 'Local preview with simulated services.')),
      h(Footer, { policyLinks }))));
`

const server = await createServer({
  envDir: false,
  cacheDir: 'node_modules/.vite-gp266-preview',
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'react-router-dom', 'lucide-react'],
  },
  server: { host: '127.0.0.1', port, strictPort: true, open: false },
  plugins: [{
    name: 'footer-preview',
    resolveId(id) { if (id === 'virtual:gp266-footer') return entry },
    load(id) { if (id === entry) return footerFixture },
    transform(code, id) {
      const path = id.replaceAll('\\', '/')
      if (path.endsWith('/src/lib/supabase.js')) return serviceFixture
      if (path.includes('/node_modules/@emailjs/browser/') && /\.(m?js)$/.test(path)) {
        return 'export default { send: async () => { throw new Error("Email is disabled in the footer preview.") } };'
      }
    },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        const path = new URL(req.url, origin).pathname
        // Block external connections even during manual preview; allow local HMR.
        res.setHeader('Content-Security-Policy', "connect-src 'self' ws://127.0.0.1:" + port)
        if (!path.startsWith('/__gp266/')) return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(await vite.transformIndexHtml(path, `<!doctype html><html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Garage Glo footer preview</title></head><body>
          <div id="root"></div><script type="module" src="/@id/virtual:gp266-footer"></script>
          </body></html>`))
      })
    },
  }],
})
await server.listen()
console.log('Footer preview: ' + origin + '/__gp266/footer')
console.log('Real homepage with simulated services: ' + origin + '/')
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await server.close(); process.exit(0) })
}
