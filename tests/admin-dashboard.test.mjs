import assert from 'node:assert/strict'
import test from 'node:test'
import { createAdminDashboardController, loadAdminDashboard } from '../src/lib/adminDashboard.js'

function makeClient({ user = { id: 'admin' }, userError = null, data = { todayCount: 2 }, error = null } = {}) {
  let authCallback
  let unsubscribed = false
  let rpcCalls = 0
  const client = {
    auth: {
      getUser: async () => ({ data: { user }, error: userError }),
      onAuthStateChange(callback) {
        authCallback = callback
        return { data: { subscription: { unsubscribe() { unsubscribed = true } } } }
      },
    },
    async rpc(name) {
      assert.equal(name, 'get_admin_dashboard_summary')
      rpcCalls++
      return { data, error }
    },
  }
  return {
    client,
    emit: (event, session) => authCallback(event, session),
    get rpcCalls() { return rpcCalls },
    get unsubscribed() { return unsubscribed },
  }
}

test('loads the authorized database summary', async () => {
  const fixture = makeClient()
  assert.deepEqual(await loadAdminDashboard(fixture.client), { status: 'ready', summary: { todayCount: 2 } })
  assert.equal(fixture.rpcCalls, 1)
})

test('guest and missing-session states never call the summary RPC', async () => {
  for (const userError of [null, { name: 'AuthSessionMissingError' }]) {
    const fixture = makeClient({ user: null, userError })
    assert.deepEqual(await loadAdminDashboard(fixture.client), { status: 'denied', summary: null })
    assert.equal(fixture.rpcCalls, 0)
  }
})

test('server authorization failure is denied, without exposing returned data', async () => {
  const fixture = makeClient({ error: { code: '42501' } })
  assert.deepEqual(await loadAdminDashboard(fixture.client), { status: 'denied', summary: null })
})

test('network, migration and missing-response failures become retryable errors', async () => {
  for (const options of [
    { userError: { name: 'AuthRetryableFetchError' } },
    { error: { code: 'PGRST202' } },
    { data: null },
  ]) {
    assert.deepEqual(await loadAdminDashboard(makeClient(options).client), { status: 'error', summary: null })
  }
  const { client } = makeClient()
  client.rpc = async () => { throw new Error('offline') }
  assert.equal((await loadAdminDashboard(client)).status, 'error')
})

test('a valid empty database response remains a successful result', async () => {
  const data = { todayCount: 0, todayAppointments: [], customerCount: 0, vehicleCount: 0,
    lowestStock: [], activeServiceCount: 0, popularService: null, pendingCount: 0 }
  assert.deepEqual(await loadAdminDashboard(makeClient({ data }).client), { status: 'ready', summary: data })
})

test('refresh clears stale data and can recover after an error', async () => {
  const fixture = makeClient({ error: { code: 'offline' } })
  const states = []
  const controller = createAdminDashboardController(fixture.client, (state) => states.push(state))
  await controller.refresh()
  fixture.client.rpc = async () => ({ data: { todayCount: 3 }, error: null })
  await controller.refresh()
  assert.deepEqual(states.map((state) => state.status), ['loading', 'error', 'loading', 'ready'])
  assert.equal(states[2].summary, null)
  assert.equal(states[3].summary.todayCount, 3)
  controller.dispose()
})

test('signing out clears data immediately and discards an in-flight response', async () => {
  const fixture = makeClient()
  let complete
  let started
  const rpcStarted = new Promise((resolve) => { started = resolve })
  fixture.client.rpc = () => { started(); return new Promise((resolve) => { complete = resolve }) }
  const states = []
  const controller = createAdminDashboardController(fixture.client, (state) => states.push(state))
  const pending = controller.refresh()
  await rpcStarted
  fixture.emit('SIGNED_OUT', null)
  assert.deepEqual(states.at(-1), { status: 'denied', summary: null })
  complete({ data: { todayCount: 99 }, error: null })
  await pending
  assert.deepEqual(states.map((state) => state.status), ['loading', 'denied'])
  controller.dispose()
})

test('the latest refresh wins when requests finish out of order', async () => {
  const fixture = makeClient()
  const responses = []
  fixture.client.rpc = () => new Promise((resolve) => responses.push(resolve))
  const states = []
  const controller = createAdminDashboardController(fixture.client, (state) => states.push(state))
  const first = controller.refresh()
  await Promise.resolve()
  const second = controller.refresh()
  await Promise.resolve()
  responses[1]({ data: { todayCount: 2 }, error: null })
  await second
  responses[0]({ data: { todayCount: 1 }, error: null })
  await first
  assert.deepEqual(states.at(-1), { status: 'ready', summary: { todayCount: 2 } })
  assert.equal(states.filter((state) => state.status === 'ready').length, 1)
  controller.dispose()
})

test('session changes clear the old summary before reloading', async () => {
  const fixture = makeClient()
  const states = []
  const controller = createAdminDashboardController(fixture.client, (state) => states.push(state))
  await controller.refresh()
  fixture.emit('SIGNED_IN', { user: { id: 'different-account' } })
  assert.deepEqual(states.at(-1), { status: 'loading', summary: null })
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(fixture.rpcCalls, 2)
  assert.equal(states.at(-1).status, 'ready')
  controller.dispose()
})

test('cleanup unsubscribes and prevents queued or completed work updating an unmounted page', async () => {
  const fixture = makeClient()
  const states = []
  const controller = createAdminDashboardController(fixture.client, (state) => states.push(state))
  const pending = controller.refresh()
  controller.dispose()
  fixture.emit('SIGNED_IN', { user: { id: 'admin' } })
  await pending
  await controller.refresh()
  assert.equal(fixture.unsubscribed, true)
  assert.deepEqual(states.map((state) => state.status), ['loading'])
})
