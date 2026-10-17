// Fixed, Jira-required text fields only. Values are quoted for PostgREST's
// filter grammar and escaped separately for PostgreSQL regular expressions.
const textFields = ['first_name', 'last_name', 'email', 'phone']

export function appointmentSearchFilter(value) {
  const term = value.trim()
  if (!term) return ''

  // A literal, unanchored case-insensitive match. Unlike ilike, imatch does
  // not alias * to %, so punctuation remains literal in every search term.
  const pattern = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const quoted = `"${pattern.replace(/[\\"]/g, '\\$&')}"`
  const filters = textFields.map((field) => `${field}.imatch.${quoted}`)

  // Dates are typed in the existing security-invoker view. Use date bounds
  // instead of casting a column or introducing a new database function/view.
  const displayDate = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/.exec(term)
  const dateTerm = displayDate
    ? `${displayDate[3].length === 2 ? `20${displayDate[3]}` : displayDate[3]}-${displayDate[1].padStart(2, '0')}-${displayDate[2].padStart(2, '0')}`
    : term
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(dateTerm)
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2] || 1)
    const day = Number(match[3] || 1)
    const start = new Date(`${match[1]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`)
    if (year >= 1 && year < 9999 && !Number.isNaN(start.valueOf())
      && start.getUTCMonth() === month - 1 && start.getUTCDate() === day) {
      const end = new Date(start)
      if (match[3]) end.setUTCDate(day + 1)
      else if (match[2]) end.setUTCMonth(month)
      else end.setUTCFullYear(year + 1)
      filters.push(`and(appointment_date.gte.${start.toISOString().slice(0, 10)},appointment_date.lt.${end.toISOString().slice(0, 10)})`)
    }
  }
  return filters.join(',')
}
