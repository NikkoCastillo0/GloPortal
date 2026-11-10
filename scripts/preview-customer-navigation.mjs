import { createServer } from 'vite'

const port = 4189
const serviceFixture = `
  const params = new URLSearchParams(location.search);
  const role = params.get('role') || 'customer';
  const access = params.get('access') || 'authorized';
  const empty = { data: [], count: 0, error: null };
  export const supabase = {
    auth: {
      getUser: async () => {
        if (access === 'loading') return new Promise(() => {});
        return { data: { user: access === 'signed-out' ? null : { id: 'navigation-preview-user' } }, error: null };
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

// Serve the real application with local fixtures, never live account or database data.
const server = await createServer({
  envDir: false,
  cacheDir: 'node_modules/.vite-gp159-preview',
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'react-router-dom', '@base-ui/react/dialog', 'lucide-react'],
    exclude: ['@emailjs/browser'],
  },
  server: { host: '127.0.0.1', port, strictPort: true, open: false },
  plugins: [{
    name: 'customer-navigation-preview',
    transform(code, id) {
      const path = id.replaceAll('\\', '/')
      if (path.endsWith('/src/lib/supabase.js')) return serviceFixture
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
console.log('GP-159 preview (simulated customer): http://127.0.0.1:' + port + '/customerportal')
console.log('Partially functional: two destinations available; four menu options coming soon.')
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await server.close(); process.exit(0) })
}
