import { createServer } from 'vite'
import { dashboardSummary, emptyDashboardSummary } from './admin-dashboard-fixtures.mjs'

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
        import { BrowserRouter, Routes, Route } from 'react-router-dom';
        import '/src/index.css';
        import AdminPortal from '/src/pages/AdminPortal.jsx';
        const routeSearch = location.search;
        window.history.replaceState(null, '', '/adminportal' + routeSearch);
        createRoot(document.getElementById('root')).render(
          React.createElement(React.StrictMode, null,
            React.createElement(BrowserRouter, null,
              React.createElement(Routes, null,
                React.createElement(Route, { path: '/adminportal', element: React.createElement(AdminPortal) }),
                React.createElement(Route, { path: '/login', element: React.createElement('main', null, React.createElement('h1', null, 'Login Preview')) }),
                React.createElement(Route, { path: '/customerportal', element: React.createElement('main', null, React.createElement('h1', null, 'Customer Portal Preview')) }),
                React.createElement(Route, { path: '/viewappointments', element: React.createElement('main', null, React.createElement('h1', null, 'All Appointments Preview')) }),
                React.createElement(Route, { path: '/viewcustomers', element: React.createElement('main', null, React.createElement('h1', null, 'All Customers Preview')) }),
                React.createElement(Route, { path: '/viewinventory', element: React.createElement('main', null, React.createElement('h1', null, 'All Inventory Preview')) }),
                React.createElement(Route, { path: '/editservices', element: React.createElement('main', null, React.createElement('h1', null, 'Edit Services Preview')) }),
                React.createElement(Route, { path: '/viewappointmentrequests', element: React.createElement('main', null, React.createElement('h1', null, 'Appointment Requests Preview')) })
              )
            )
          )
        );
        `
    },
    transform(code, id) {
      if (!id.replaceAll('\\', '/').endsWith('/src/lib/supabase.js')) return
      return `let currentAuth = new URLSearchParams(location.search).get('auth') || 'admin';
        export const supabase = {
          auth: {
            getUser: async () => ({ data: { user: currentAuth === 'guest' ? null : { id: 'synthetic-user' } }, error: null }),
            onAuthStateChange(callback) {
              const handleAuth = (event) => {
                currentAuth = event.detail;
                callback(currentAuth === 'guest' ? 'SIGNED_OUT' : 'SIGNED_IN', currentAuth === 'guest' ? null : { user: { id: 'synthetic-user' } });
              };
              window.addEventListener('admin-preview-auth', handleAuth);
              return { data: { subscription: { unsubscribe() { window.removeEventListener('admin-preview-auth', handleAuth); } } } };
            }
          },
          from(table) {
            if (table !== 'profiles') throw new Error('Unexpected fixture table');
            return { select: () => ({ eq: () => ({ single: async () => ({ data: { role: currentAuth === 'customer' ? 'customer' : 'admin' }, error: null }) }) }) };
          },
          rpc: async (name) => {
            if (name !== 'get_admin_dashboard_summary') throw new Error('Unexpected RPC');
            const params = new URLSearchParams(location.search);
            params.set('auth', currentAuth);
            return (await fetch('/__admin-api/summary?' + params)).json();
          }
        };`
    },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        if (url.pathname === '/__admin-api/summary') {
          res.setHeader('Content-Type', 'application/json')
          const state = url.searchParams.get('state')
          if (state === 'loading') return
          const error = url.searchParams.get('auth') === 'customer'
            ? { code: '42501' }
            : state === 'error' ? { code: 'PGRST202' } : null
          res.end(JSON.stringify({ data: error ? null : state === 'empty' ? emptyDashboardSummary : dashboardSummary, error }))
          return
        }
        if (url.pathname !== '/__admin-preview/') return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(await vite.transformIndexHtml(req.url, `<!doctype html><html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin dashboard test preview</title></head><body>
          <aside>Synthetic test fixtures — not live shop data.</aside>
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
