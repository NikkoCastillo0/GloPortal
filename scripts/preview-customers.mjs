import { createServer } from 'vite'

const port = 4184
const origin = `http://127.0.0.1:${port}`
const entry = '\0gp268-preview'
const customerPaths = new Set(['/viewcustomers'])
const server = await createServer({
  envDir: false,
  cacheDir: 'node_modules/.vite-gp268-preview',
  optimizeDeps: {
    noDiscovery: true,
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'react-router-dom', '@base-ui/react/dialog', 'lucide-react'],
  },
  server: { host: '127.0.0.1', port, strictPort: true, open: false },
  plugins: [{
    name: 'customers-ui-preview',
    resolveId(id) { if (id === 'virtual:gp268-preview') return entry },
    load(id) {
      if (id !== entry) return
      return `import React from 'react';
        import { createRoot } from 'react-dom/client';
        import '/src/index.css';
        import App from '/src/App.jsx';
        createRoot(document.getElementById('root')).render(React.createElement(React.StrictMode, null, React.createElement(App)));`
    },
    transform(code, id) {
      if (!id.replaceAll('\\', '/').endsWith('/src/lib/supabase.js')) return
      // Fixture-only Header identity. No environment credentials or backend calls.
      return `export const supabase = {
        auth: {
          getSession: async () => ({ data: { session: { user: { id: 'gp268-preview-admin' } } } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
          signOut: async () => ({ error: null })
        },
        from: () => ({ select() { return this }, eq() { return this }, single: async () => ({ data: { role: 'admin' }, error: null }) })
      };`
    },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url, origin).pathname
        if (!customerPaths.has(pathname)) return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Content-Security-Policy', `connect-src 'self' ws://127.0.0.1:${port}`)
        res.end(await vite.transformIndexHtml(pathname, `<!doctype html><html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>GP-268 Customer UI preview</title></head><body>
          <div id="root"></div><script type="module" src="/@id/virtual:gp268-preview"></script></body></html>`))
      })
    },
  }],
})
await server.listen()
console.log(`Customer UI preview (synthetic header identity; no backend): ${origin}/viewcustomers`)
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await server.close(); process.exit(0) })
}
