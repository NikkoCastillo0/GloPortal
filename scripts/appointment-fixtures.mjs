// Synthetic records only. No production customer information.
export const appointments = Array.from({ length: 17 }, (_, index) => ({
  id: `fixture-${String(index).padStart(2, '0')}`,
  starts_at: `2026-10-${String(16 + (index % 3)).padStart(2, '0')}T17:00:00Z`,
  appointment_date: `2026-10-${String(16 + (index % 3)).padStart(2, '0')}`,
  status: 'completed',
  last_name: ['Zulu', 'Alpha', 'River', 'Baker'][index % 4],
  first_name: `Test ${String(index).padStart(2, '0')}`,
  email: index === 0 ? 'special+tag,(quoted)"\\_*%@example.invalid' : `fixture${index}@example.invalid`,
  phone: '555-0100',
  service_name: 'Fixture detail service',
  vehicle: '2024 Test Vehicle',
  quoted_price_cents: 15000,
  notes: 'SYNTHETIC TEST FIXTURE',
  completed_job_count: (index % 5) + 1,
}))

export function queryFixtures(params) {
  let rows = appointments.filter((row) => (
    (!params.has('appointment_date') || row.appointment_date === params.get('appointment_date').slice(3))
    && row.status === params.get('status')?.slice(3)
  ))
  const search = params.get('or')
  if (search) {
    // Interpret REST syntax independently of the production query builder.
    const texts = [...search.matchAll(/(first_name|last_name|email|phone)\.imatch\.("(?:\\.|[^"\\])*")/g)]
      .map(([, field, encoded]) => {
        return { field, regex: new RegExp(JSON.parse(encoded), 'i') }
      })
    const bounds = /appointment_date\.gte\.([\d-]+),appointment_date\.lt\.([\d-]+)/.exec(search)
    rows = rows.filter((row) => texts.some(({ field, regex }) => regex.test(row[field] ?? ''))
      || (bounds && row.appointment_date >= bounds[1] && row.appointment_date < bounds[2]))
  }
  const orders = (params.get('order') || '').split(',').filter(Boolean)
  rows = rows.toSorted((left, right) => {
    for (const order of orders) {
      const [field, direction] = order.split('.')
      const a = left[field]
      const b = right[field]
      const comparison = typeof a === 'number' ? a - b : String(a).localeCompare(String(b))
      if (comparison) return direction === 'desc' ? -comparison : comparison
    }
    return 0
  })
  const count = rows.length
  const offset = Number(params.get('offset') || 0)
  const limit = Number(params.get('limit') || 6)
  return { rows: rows.slice(offset, offset + limit), count, offset }
}
