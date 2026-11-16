import { createServer } from 'vite'

const port = 4180
const origin = `http://127.0.0.1:${port}`
const entry = '\0gp160-preview'
const server = await createServer({
  envDir: false,
  cacheDir: 'node_modules/.vite-gp160-preview',
  optimizeDeps: {
    noDiscovery: true,
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'react-router-dom', '@base-ui/react/dialog', 'lucide-react'],
  },
  server: { host: '127.0.0.1', port, strictPort: true, open: false },
  plugins: [{
    name: 'customer-menu-preview',
    resolveId(id) { if (id === 'virtual:gp160-preview') return entry },
    load(id) {
      if (id !== entry) return
      // These sample destinations/actions exist only in this local fixture.
      return `import React, { useId, useRef, useState } from 'react';
        import { createRoot } from 'react-dom/client';
        import { LayoutDashboard, CalendarDays, Users, LogOut, ChevronRight } from 'lucide-react';
        import '/src/index.css';
        import Header from '/src/components/layout/Header.jsx';
        import CustomerMenuOverlay from '/src/components/navigation/CustomerMenuOverlay.jsx';
        const h = React.createElement;
        const params = new URLSearchParams(location.search);
        const mode = params.get('mode') || 'customer';
        function Preview() {
          const [isOpen, setIsOpen] = useState(false);
          const [closeRequests, setCloseRequests] = useState(0);
          const [selection, setSelection] = useState('None');
          const triggerRef = useRef(null);
          const menuId = useId();
          function requestClose() {
            setCloseRequests(count => count + 1);
            if (!params.has('hold-open')) setIsOpen(false);
          }
          const items = params.has('custom')
            ? [['Custom destination', LayoutDashboard, 'custom']]
            : [['Dashboard', LayoutDashboard, 'dashboard'], ['Book Appointments', CalendarDays, 'booking'],
               ['Change Password', Users, 'password'], ['Sign out', LogOut, null]];
          if (params.has('long')) {
            for (let index = 1; index <= 16; index++) items.push(['Extra option ' + index, LayoutDashboard, 'extra-' + index]);
          }
          const content = items.map(([label, Icon, destination], index) => h(destination ? 'a' : 'button', {
            key: label,
            ...(destination ? { href: '#preview-' + destination } : { type: 'button' }),
            'aria-current': index === 0 ? 'page' : undefined,
            className: 'flex items-center gap-3',
            onClick: () => setSelection(label),
          }, h(Icon, { className: 'size-5 shrink-0 md:hidden', 'aria-hidden': true }),
             h('span', { className: 'min-w-0 flex-1' }, label),
             h(ChevronRight, { className: 'size-[18px] shrink-0 text-[#717171] md:hidden', 'aria-hidden': true })));
          return h(React.Fragment, null,
            mode === 'controlled' ? h(React.Fragment, null,
              h(Header, { role: 'customer', isHome: true }),
              h('button', { ref: triggerRef, type: 'button', onClick: () => setIsOpen(true),
                'aria-haspopup': 'dialog', 'aria-expanded': isOpen,
                'aria-controls': isOpen ? menuId : undefined,
                className: 'm-6 rounded-lg bg-[#323232] p-3 text-white' }, 'Open controlled menu'),
              h(CustomerMenuOverlay, { id: menuId, isOpen, onClose: requestClose, returnFocusRef: triggerRef }, content)
            ) : h(Header, { role: mode === 'admin' ? 'admin' : 'customer',
              isHome: true, isSignedIn: mode !== 'guest', customerMenuContent: content,
              adminMenuContent: mode === 'admin' ? content : undefined }),
            h('main', { className: 'min-h-[1800px] bg-[#999999] p-6 text-[#242424]' },
              h('h1', { className: 'text-2xl font-semibold' }, 'Customer menu preview'),
              h('p', { className: 'mt-3' }, 'Local fixture: sample links and actions only.'),
              h('p', null, 'Mode: ' + mode),
              h('p', { role: 'status' }, 'Close requests: ' + closeRequests + '. Selected: ' + selection),
              h('a', { href: '#preview-background', className: 'mt-4 inline-block underline' }, 'Background link')));
        }
        createRoot(document.getElementById('root')).render(h(React.StrictMode, null, h(Preview)));`
    },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        if (new URL(req.url, origin).pathname !== '/__gp160/') return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Content-Security-Policy', `connect-src 'self' ws://127.0.0.1:${port}`)
        res.end(await vite.transformIndexHtml('/__gp160/', `<!doctype html><html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Customer menu preview</title></head><body>
          <div id="root"></div><script type="module" src="/@id/virtual:gp160-preview"></script></body></html>`))
      })
    },
  }],
})
await server.listen()
console.log(`Customer menu preview: ${origin}/__gp160/`)
console.log('Use ?mode=guest, ?mode=admin, or ?mode=controlled to inspect other states.')
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => { await server.close(); process.exit(0) })
}
