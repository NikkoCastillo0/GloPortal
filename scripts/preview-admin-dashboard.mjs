import { createServer } from 'vite'

const port = process.argv.includes('--test') ? 4178 : 4177
const entry = '\0admin-dashboard-preview'
const server = await createServer({
  cacheDir: `node_modules/.vite-admin-dashboard-${port}`,
  server: { host: '127.0.0.1', port, strictPort: true },
  plugins: [{
    name: 'admin-dashboard-preview',
    resolveId(id) {
      if (id === 'virtual:admin-dashboard-preview') return entry
    },
    load(id) {
      if (id !== entry) return
      return `import React from 'react';
        import { createRoot } from 'react-dom/client';
        import '/src/index.css';
        import AdminPortal from '/src/pages/AdminPortal.jsx';
        createRoot(document.getElementById('root')).render(
          React.createElement(React.StrictMode, null, React.createElement(AdminPortal))
        );`
    },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        if (new URL(req.url, 'http://localhost').pathname !== '/__admin-preview/') return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(await vite.transformIndexHtml(req.url, `<!doctype html><html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin dashboard test preview</title></head><body>
          <div id="root"></div><script type="module" src="/@id/virtual:admin-dashboard-preview"></script>
          </body></html>`))
      })
    },
  }],
})

await server.listen()
console.log(`Admin dashboard preview: http://127.0.0.1:${port}/__admin-preview/`)
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await server.close(); process.exit(0) })
}
