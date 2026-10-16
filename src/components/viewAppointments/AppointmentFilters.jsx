const filterOptions = [
  { value: 'date', label: 'by date' },
  { value: 'az', label: 'A-Z' },
  { value: 'za', label: 'Z-A' },
  { value: 'most-jobs', label: 'Most jobs' },
  { value: 'least-jobs', label: 'Least jobs' },
]

export default function AppointmentFilters({ value, onChange, date, onDateChange }) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <label className="grid gap-1">
        <span className="sr-only">Filter appointments</span>
        <select
          aria-label="Filter appointments"
          className="min-h-11 rounded border bg-white px-3 py-2"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        <span>Appointment date (Pacific time)</span>
        <input
          type="date"
          aria-label="Appointment date"
          value={date}
          className="min-h-11 max-w-full rounded border bg-white px-3 py-2"
          onChange={(event) => onDateChange(event.target.value)}
        />
      </label>
      {date && (
        <button
          type="button"
          className="min-h-11 rounded border px-3"
          onClick={() => onDateChange('')}
        >
          Clear date
        </button>
      )}
    </div>
  )
}
