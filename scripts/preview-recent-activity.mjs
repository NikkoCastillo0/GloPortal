import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'

const port = 4193
const appRoot = process.env.GP183_APP_ROOT || process.cwd()
const serviceFixture = `
  const params = new URLSearchParams(location.search);
  const access = params.get('access') || 'authorized';
  const role = params.get('role') || 'customer';
  const empty = { data: [], count: 0, error: null };
  export const supabase = {
    auth: {
      getUser: async () => {
        if (access === 'loading') return new Promise(() => {});
        return { data: { user: access === 'signed-out' ? null : { id: 'recent-activity-preview-user' } }, error: null };
      },
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Sign-in is disabled in this local preview.' } }),
      signUp: async () => ({ data: null, error: { message: 'Sign-up is disabled in this local preview.' } }),
    },
    from: (table) => ({
      select() { return this; }, eq() { return this; }, order() { return this; },
      or() { return this; }, gte() { return this; }, lt() { return this; },
      limit() { return this; },
      maybeSingle: async () => ({ data: table === 'appointments' ? {
        id: 'recent-activity-preview-appointment',
        starts_at: '2099-10-10T14:30:00.000Z',
        ends_at: '2099-10-10T15:30:00.000Z',
        status: 'Scheduled',
        services: { name: 'Tire Patch' },
        vehicles: { year: 2022, make: 'Toyota', model: 'Camry', license_plate: 'GP183-LOCAL' },
      } : null, error: null }),
      single: async () => ({ data: { role: access === 'denied' ? 'unknown' : role }, error: null }),
      range: async () => empty,
      then(resolve, reject) { return Promise.resolve(empty).then(resolve, reject); },
    }),
    rpc: async () => empty,
  };
`

// Prop-level scenarios do not depend on CustomerPortal's changing data source.
const previewEntry = '\0gp183-recent-activity'
const activityPreview = `
  import React from 'react';
  import { createRoot } from 'react-dom/client';
  import '/src/index.css';
  import RecentActivity from '/src/components/dashboard/RecentActivity.jsx';
  import QuickActions from '/src/components/dashboard/QuickActions.jsx';
  const scenario = new URLSearchParams(location.search).get('activity') || 'mixed';
  const activities = [
    { id: 'appointment', title: 'Appointment Scheduled: Tire Patch - Oct 10, 2026', timestamp: '2026-10-01' },
    { id: 'vehicle', title: 'Vehicle Added: 2022 Toyota Camry', timestamp: '2026-09-22' },
  ];
  let selected = activities;
  if (scenario === 'appointments') selected = activities.slice(0, 1);
  if (scenario === 'vehicles') selected = activities.slice(1);
  if (scenario === 'empty') selected = [];
  if (scenario === 'missing') selected = undefined;
  if (scenario === 'null') selected = null;
  if (scenario === 'no-timestamps' || scenario === 'partial-timestamps') {
    selected = activities.map((activity, index) => {
      const item = { ...activity };
      if (scenario === 'no-timestamps' || index === 1) delete item.timestamp;
      return item;
    });
  }
  if (scenario === 'long') selected = [
    {
      id: 'long-appointment',
      title: 'Appointment Scheduled: Tire mounting and balancing for a customer vehicle with a detailed service description and reference ' + 'APPOINTMENT'.repeat(12),
      timestamp: '2026-10-01T14:30:00.000Z',
    },
    {
      id: 'long-vehicle',
      title: 'Vehicle Added: 2024 Mercedes-Benz Sprinter, white, VIN: 1HGCM82633A004352. Fleet reference: ' + 'VEHICLE'.repeat(16),
      timestamp: '2026-09-22',
    },
  ];
  const props = scenario === 'missing' ? {} : { activities: selected };
  createRoot(document.getElementById('root')).render(
    React.createElement('main', { className: 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8' },
      React.createElement('h1', { className: 'mb-8 text-3xl font-bold' }, 'Recent Activity preview'),
      React.createElement('div', { className: 'grid grid-cols-1 gap-6 md:grid-cols-2' },
        React.createElement(QuickActions),
        React.createElement(RecentActivity, props),
      ),
    ),
  );
`

// Preview real application routes without loading environment files or live services.
const server = await createServer({
  // Optional exported develop snapshot for compatibility checks; no checkout or merge.
  root: appRoot,
  envDir: false,
  cacheDir: process.env.GP183_APP_ROOT ? 'node_modules/.vite-gp183-develop-preview' : 'node_modules/.vite-gp183-preview',
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'react-router-dom', '@base-ui/react/dialog', 'lucide-react'],
    exclude: ['@emailjs/browser'],
  },
  server: {
    host: '127.0.0.1', port, strictPort: true, open: false,
    // A develop snapshot can reuse this worktree's dependencies through a junction.
    fs: { allow: [appRoot, fileURLToPath(new URL('../node_modules', import.meta.url))] },
  },
  plugins: [{
    name: 'recent-activity-preview',
    resolveId(id) { if (id === 'virtual:gp183-recent-activity') return previewEntry },
    load(id) { if (id === previewEntry) return activityPreview },
    transform(code, id) {
      const path = id.replaceAll('\\', '/')
      if (path.endsWith('/src/lib/supabase.js')) return serviceFixture
      if (path.includes('/node_modules/@emailjs/browser/') && /\.(m?js)$/.test(path)) {
        return 'export default { send: async () => { throw new Error("Email is disabled in this local preview.") } };'
      }
    },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        res.setHeader('Content-Security-Policy', "connect-src 'self' ws://127.0.0.1:" + port)
        if (new URL(req.url, 'http://127.0.0.1:' + port).pathname === '/__gp183/') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(await vite.transformIndexHtml(req.url, `<!doctype html>
            <html lang="en" class="dark"><head><meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>GP-183 local component preview</title></head><body>
            <div id="root"></div><script type="module" src="/@id/virtual:gp183-recent-activity"></script>
            </body></html>`))
          return
        }
        next()
      })
    },
  }],
})
await server.listen()
console.log('GP-183 component scenarios: http://127.0.0.1:' + port + '/__gp183/')
console.log('Real dashboard with simulated services: http://127.0.0.1:' + port + '/customerportal')
console.log('Activity scenarios: ?activity=appointments, vehicles, empty, missing, null, no-timestamps, partial-timestamps, long')
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await server.close(); process.exit(0) })
}
