import AdminDataTable from '../admin/AdminDataTable.jsx'
import AdminStatusBadge from '../admin/AdminStatusBadge.jsx'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Los_Angeles',
})

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const columns = [
  {
    key: 'requested_at',
    header: 'Request',
    render: (request) => (
      <div className="flex items-center justify-between gap-2">
        <span>
          {formatRequestedAt(request.requested_at)}
        </span>

        <span>
          <AdminStatusBadge status={request.status} />
        </span>
      </div>
    ),
  },
  {
    key: 'customer_name',
    header: 'Customer',
  },
  {
    key: 'contact',
    header: 'Contact',
    render: (request) => (
      <div className="grid gap-1">
        <span>{request.email || '-'}</span>
        <span>{request.phone || '-'}</span>
      </div>
    ),
  },
  { key: 'vehicle', header: 'Vehicle' },
  { key: 'service_name', header: 'Service' },
  {
    key: 'price_cents',
    header: 'Price',
    render: (request) =>
      request.price_cents == null
        ? '-'
        : priceFormatter.format(request.price_cents / 100),
  },
  {
    key: 'notes',
    header: 'Notes',
    render: (request) => request.notes || '-',
  },
]

function formatRequestedAt(value){
    if(!value) return 'Date and time unavailable'

    const date = new Date(value)

    if(Number.isNaN(date.getTime())){
        return 'Date and time unavailable'
    }

    return dateFormatter.format(date)
}

export default function AppointmentRequestTable({
  requests = [],
  onEdit,
  onAccept,
  onDeny,
}) {
  return (
    <AdminDataTable
      rows={requests}
      columns={columns}
      getRowKey={(request) => request.id}
      emptyMessage="No appointment requests found."
      actions={(request) => (
        <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
            <button
            type="button"
            onClick={() => onEdit?.(request)}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#cccccc] bg-white px-3 text-sm font-semibold text-[#323232] hover:bg-[#f4f4f4]"
            >
            Edit
            </button>

           <button
            type="button"
            onClick={() => onAccept?.(request)}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-green-200 bg-green-100 px-3 text-sm font-semibold text-green-900 hover:bg-green-200"
            >
            Accept
            </button>

            <button
            type="button"
            onClick={() => onDeny?.(request)}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 bg-red-100 px-3 text-sm font-semibold text-red-900 hover:bg-red-200"            >
            Deny
            </button>
        </div>
        )}
    />
  )
}