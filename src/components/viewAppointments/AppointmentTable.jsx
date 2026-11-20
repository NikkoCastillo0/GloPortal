
import { useEffect, useState } from 'react'
import { appointmentSearchFilter } from '../../lib/appointmentSearch.js'
import { supabase } from '../../lib/supabase.js'
import AdminDataTable from '../admin/AdminDataTable.jsx'
import AdminStatusBadge from '../admin/AdminStatusBadge.jsx'
import {AdminErrorState, AdminLoadingState} from '../admin/AdminFeedback.jsx'

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
  {
    key: 'starts_at',
    header: 'Date & Time',
    render: (appointment) => formatDate(appointment.starts_at),
  },
  {
    key: 'customer',
    header: 'Customer',
    render: (appointment) =>
      `${appointment.first_name ?? ''} ${appointment.last_name ?? ''}`.trim() || '-',
  },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'vehicle', header: 'Vehicle' },
  { key: 'service_name', header: 'Service' },
  {
    key: 'quoted_price_cents',
    header: 'Price',
    render: (appointment) => formatPrice(appointment.quoted_price_cents),
  },
  {
    key: 'status',
    header: 'Status',
    render: (appointment) => <AdminStatusBadge status={appointment.status} />,
  },
  {
    key: 'notes',
    header: 'Notes',
    render: (appointment) => appointment.notes || '-',
  },
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
  search = '',
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

        // The view derives this date in Pacific time, including DST boundaries.
        if (date) query = query.eq('appointment_date', date)

        const searchFilter = appointmentSearchFilter(search)
        if (searchFilter) query = query.or(searchFilter)

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


  }, [filter, search, date, page, pageSize, onTotalCountChange, onLoadingChange])


  if (isLoading) {
    return <AdminLoadingState message="Loading appointments..." />
  }

  if (errorMessage) {
    return <AdminErrorState>{errorMessage}</AdminErrorState>
  }

  return (
    <AdminDataTable
      rows={appointments}
      columns={columns}
      getRowKey={(appointment) => appointment.id}
      emptyMessage="No appointments found."
      actions={(appointment) => (
        <a
          href={`/editappointment?id=${encodeURIComponent(appointment.id)}`}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#cccccc] bg-white px-3 text-sm font-semibold text-[#323232] hover:bg-[#f4f4f4]"
        >
          Edit
        </a>
      )}
    />
  )

}
