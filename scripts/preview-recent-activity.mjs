import { createServer } from 'vite'

const port = 4193
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
    from: () => ({
      select() { return this; }, eq() { return this; }, order() { return this; },
      or() { return this; }, gte() { return this; }, lt() { return this; },
      single: async () => ({ data: { role: access === 'denied' ? 'unknown' : role }, error: null }),
      range: async () => empty,
      then(resolve, reject) { return Promise.resolve(empty).then(resolve, reject); },
    }),
    rpc: async () => empty,
  };
`

// Test scenarios alter only the served module; the committed mock file stays intact.
const activityScenarios = `
  const scenario = new URLSearchParams(location.search).get('activity') || 'mixed';
  const activities = mockCustomerDashboardData.recentActivities;
  if (scenario === 'appointments') mockCustomerDashboardData.recentActivities = activities.slice(0, 1);
  if (scenario === 'vehicles') mockCustomerDashboardData.recentActivities = activities.slice(1);
  if (scenario === 'empty') mockCustomerDashboardData.recentActivities = [];
  if (scenario === 'missing') delete mockCustomerDashboardData.recentActivities;
  if (scenario === 'null') mockCustomerDashboardData.recentActivities = null;
  if (scenario === 'no-timestamps' || scenario === 'partial-timestamps') {
    mockCustomerDashboardData.recentActivities = activities.map((activity, index) => {
      const item = { ...activity };
      if (scenario === 'no-timestamps' || index === 1) delete item.timestamp;
      return item;
    });
  }
  if (scenario === 'long') mockCustomerDashboardData.recentActivities = [
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
`

// Preview real application routes without loading environment files or live services.
const server = await createServer({
  envDir: false,
  cacheDir: 'node_modules/.vite-gp183-preview',
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'react-router-dom', '@base-ui/react/dialog', 'lucide-react'],
    exclude: ['@emailjs/browser'],
  },
  server: { host: '127.0.0.1', port, strictPort: true, open: false },
  plugins: [{
    name: 'recent-activity-preview',
    transform(code, id) {
      const path = id.replaceAll('\\', '/')
      if (path.endsWith('/src/lib/supabase.js')) return serviceFixture
      if (path.endsWith('/src/mock/customerDashboardMock.js')) return code + '\n' + activityScenarios
      if (path.includes('/node_modules/@emailjs/browser/') && /\.(m?js)$/.test(path)) {
        return 'export default { send: async () => { throw new Error("Email is disabled in this local preview.") } };'
      }
    },
    configureServer(vite) {
      vite.middlewares.use((req, res, next) => {
        res.setHeader('Content-Security-Policy', "connect-src 'self' ws://127.0.0.1:" + port)
        next()
      })
    },
  }],
})
await server.listen()
console.log('GP-183 preview (simulated services and activity): http://127.0.0.1:' + port + '/customerportal')
console.log('Activity scenarios: ?activity=appointments, vehicles, empty, missing, null, no-timestamps, partial-timestamps, long')
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await server.close(); process.exit(0) })
}
