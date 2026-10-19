import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function AppointmentPagination({
  page,
  pageSize,
  totalCount,
  isLoading,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const displayedCount = Math.min(page * pageSize, totalCount)

  return (
    <nav aria-label="Appointment table pagination" className="appointment-pagination">
      <button
        type="button"
        className="min-h-11 min-w-11 rounded border disabled:opacity-40"
        aria-label="Previous appointments page"
        disabled={isLoading || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <span aria-live="polite">
        {displayedCount} of {totalCount}
      </span>
      <button
        type="button"
        className="min-h-11 min-w-11 rounded border disabled:opacity-40"
        aria-label="Next appointments page"
        disabled={isLoading || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight aria-hidden="true" />
      </button>
    </nav>
  )
}
