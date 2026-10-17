
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Los_Angeles',
})

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const columns = [
  'Date',
  'Last Name',
  'First Name',
  'E-Mail',
  'Phone',
  'Service',
  'Vehicle',
  'Price',
  'Notes',
  'Actions',
]

function formatDate(value) {
  return value ? dateFormatter.format(new Date(value)) : '-'
}

function formatPrice(value) {
  return value == null ? '-' : priceFormatter.format(value / 100)
}

function getSortOrder(query, filter) {
  switch (filter) {
    case 'az':
      return query
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })
        .order('starts_at', { ascending: true })
        .order('id', { ascending: true })
    case 'za':
      return query
        .order('last_name', { ascending: false })
        .order('first_name', { ascending: false })
        .order('starts_at', { ascending: true })
        .order('id', { ascending: true })
    case 'most-jobs':
      return query
        .order('completed_job_count', { ascending: false })
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })
        .order('starts_at', { ascending: true })
        .order('id', { ascending: true })
    case 'least-jobs':
      return query
        .order('completed_job_count', { ascending: true })
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })
        .order('starts_at', { ascending: true })
        .order('id', { ascending: true })
    default:
      return query
        .order('starts_at', { ascending: true })
        .order('id', { ascending: true })
  }
}

export default function AppointmentTable({
  filter,
  date,
  page,
  pageSize,
  onTotalCountChange,
  onLoadingChange,
}) {
  const [appointments, setAppointments] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCurrentRequest = true

    async function loadAppointments() {
      setIsLoading(true)
      onLoadingChange(true)
      setErrorMessage('')

      try {
        let query = supabase
          .from('appointment_filter_records')
          .select('*', { count: 'exact' })
          .eq('status', 'completed')

        // The view derives this date in Pacific time, including DST boundaries.
        if (date) query = query.eq('appointment_date', date)

        query = getSortOrder(query, filter)

        const { data, count, error } = await query.range(
          (page - 1) * pageSize,
          page * pageSize - 1,
        )

        if (!isCurrentRequest) return

        if (error) {
          setAppointments([])
          onTotalCountChange(0)
          setErrorMessage(`Unable to load appointments: ${error.message}`)
          return
        }

        setAppointments(data ?? [])
        onTotalCountChange(count ?? 0)
      } catch (error) {
        if (!isCurrentRequest) return

        setAppointments([])
        onTotalCountChange(0)
        setErrorMessage(
          `Unable to load appointments: ${
            error instanceof Error ? error.message : 'An unexpected error occurred.'
          }`,
        )
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false)
          onLoadingChange(false)
        }
      }
    }

    loadAppointments()

    return () => {
      isCurrentRequest = false
    }
  }, [filter, date, page, pageSize, onTotalCountChange, onLoadingChange])

  return (
    <div
      aria-busy={isLoading}
      className="max-w-full overflow-x-auto rounded border"
      tabIndex={0}
      role="region"
      aria-label="Appointments"
    >
      {errorMessage && <p role="alert">{errorMessage}</p>}

      <table className="w-full text-left text-sm">
        <caption className="sr-only">Completed appointments</caption>

        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length}>
                <span role="status">Loading appointments...</span>
              </td>
            </tr>
          ) : appointments.length > 0 ? (
            appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{formatDate(appointment.starts_at)}</td>
                <td>{appointment.last_name}</td>
                <td>{appointment.first_name}</td>
                <td>{appointment.email}</td>
                <td>{appointment.phone}</td>
                <td>{appointment.service_name}</td>
                <td>{appointment.vehicle}</td>
                <td>{formatPrice(appointment.quoted_price_cents)}</td>
                <td>{appointment.notes}</td>

                <td>
                  <a
                    href={`/appointments/${appointment.id}/edit`}
                    className="inline-block rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                    aria-label={`Edit appointment for ${appointment.first_name} ${appointment.last_name}`}
                  >
                    Edit Appointment
                  </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>
                {errorMessage
                  ? 'Appointments could not be loaded.'
                  : 'No completed appointments found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
