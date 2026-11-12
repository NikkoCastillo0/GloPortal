import { createServer } from 'vite'

const port = 4181
const origin = `http://127.0.0.1:${port}`
const entry = '\0gp263-preview'
const server = await createServer({
  envDir: false,
  cacheDir: 'node_modules/.vite-gp263-preview',
  optimizeDeps: {
    noDiscovery: true,
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', '@base-ui/react/dialog'],
  },
  server: { host: '127.0.0.1', port, strictPort: true, open: false },
  plugins: [{
    name: 'admin-menu-preview',
    resolveId(id) { if (id === 'virtual:gp263-preview') return entry },
    load(id) {
      if (id !== entry) return
      // Visibility here is a local visual fixture, not the production GP-211 flow.
      return `import React from 'react';
        import { createRoot } from 'react-dom/client';
        import '/src/index.css';
        import AdminMenuOverlay from '/src/components/navigation/AdminMenuOverlay.jsx';
        const h = React.createElement;
        const params = new URLSearchParams(location.search);
        createRoot(document.getElementById('root')).render(h(React.StrictMode, null,
          h('main', { className: 'min-h-[1200px] bg-[#999999] p-6 text-[#242424]' },
            h('h1', { className: 'text-2xl font-semibold' }, 'GP-263 admin menu preview'),
            h('p', { className: 'mt-3' }, 'Visual shell only. Close, navigation, and logout are separate Jira tasks.'),
            h('a', { href: '/__gp263/', className: 'mt-3 block underline' }, 'Show visual preview')),
          h(AdminMenuOverlay, { isOpen: !params.has('closed'), id: 'gp263-preview-menu' })
        ));`
    },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        if (new URL(req.url, origin).pathname !== '/__gp263/') return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Content-Security-Policy', `connect-src 'self' ws://127.0.0.1:${port}`)
        res.end(await vite.transformIndexHtml('/__gp263/', `<!doctype html><html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin menu preview</title></head><body>
          <div id="root"></div><script type="module" src="/@id/virtual:gp263-preview"></script></body></html>`))
      })
    },
  }],
})
await server.listen()
console.log(`Admin menu preview: ${origin}/__gp263/`)
console.log('Controls are visual placeholders. Use ?closed to inspect the hidden state.')
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await server.close(); process.exit(0) })
}
