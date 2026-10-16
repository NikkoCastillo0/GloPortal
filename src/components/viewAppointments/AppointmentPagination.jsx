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
    <nav aria-label="Appointment table pagination" className="flex items-center justify-end gap-4">
      <button
        type="button"
        className="min-h-11 min-w-11 rounded border disabled:opacity-40"
        aria-label="Previous appointments page"
        disabled={isLoading || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        &larr;
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
        &rarr;
      </button>
    </nav>
  )
}
