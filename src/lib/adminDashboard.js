export async function loadAdminDashboard(client) {
  try {
    const { data: userData, error: userError } = await client.auth.getUser()
    if (userError && userError.name !== 'AuthSessionMissingError') throw userError
    if (!userData?.user) return { status: 'denied', summary: null }

    const { data, error } = await client.rpc('get_admin_dashboard_summary')
    if (error?.code === '42501') return { status: 'denied', summary: null }
    if (error) throw error
    if (!data) throw new Error('Dashboard summary is missing')
    return { status: 'ready', summary: data }
  } catch {
    return { status: 'error', summary: null }
  }
}

// Discard results from a previous session, refresh or unmounted page.
export function createAdminDashboardController(client, onChange) {
  let requestId = 0
  let disposed = false

  async function refresh() {
    if (disposed) return
    const currentRequest = ++requestId
    onChange({ status: 'loading', summary: null })
    const result = await loadAdminDashboard(client)
    if (!disposed && currentRequest === requestId) onChange(result)
  }

  const { data: listener } = client.auth.onAuthStateChange((event, session) => {
    if (disposed) return
    const currentRequest = ++requestId
    if (event === 'SIGNED_OUT' || !session) {
      onChange({ status: 'denied', summary: null })
      return
    }

    onChange({ status: 'loading', summary: null })
    // Supabase calls must run outside the synchronous auth callback.
    queueMicrotask(() => {
      if (!disposed && currentRequest === requestId) refresh()
    })
  })

  return {
    refresh,
    dispose() {
      disposed = true
      requestId++
      listener.subscription.unsubscribe()
    },
  }
}
