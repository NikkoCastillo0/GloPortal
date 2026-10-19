import { ChevronDown } from 'lucide-react'

const filterOptions = [
  { value: 'date', label: 'Filter by date' },
  { value: 'az', label: 'A-Z' },
  { value: 'za', label: 'Z-A' },
  { value: 'most-jobs', label: 'Most jobs' },
  { value: 'least-jobs', label: 'Least jobs' },
]

export default function AppointmentFilters({ value, onChange, date, onDateChange, search, onSearchChange }) {
  return (
    <div className="appointment-filters">
      <label className="relative block w-[374px] max-w-full">
        <span className="sr-only">Filter appointments</span>
        <select
          aria-label="Filter appointments"
          className="h-[46px] w-full appearance-none rounded-[22.697px] border-[2.837px] border-[#d9d9d9] bg-white py-0 pl-3 pr-11 text-[clamp(20px,2.65vw,45.394px)] leading-none text-[#323232] focus-visible:outline-2 focus-visible:outline-offset-2"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-6 -translate-y-1/2 text-[#1e1e1e]"
        />
      </label>
      <label className="block w-[487px] max-w-full">
        <span className="sr-only">Search appointments</span>
        <input
          type="search"
          aria-label="Search appointments"
          aria-describedby="appointment-search-help"
          placeholder="Contains"
          title="Search name, email, phone or date (YYYY-MM-DD or M/D/YY)"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-[46px] w-full min-w-0 rounded-[22.697px] border-[2.837px] border-[#d9d9d9] bg-white px-3 py-0 text-[clamp(20px,2.65vw,45.394px)] leading-none text-[#323232] placeholder:text-[#b3b3b3] focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        <span id="appointment-search-help" className="sr-only">
          Search name, email or phone. Dates use YYYY, YYYY-MM, YYYY-MM-DD or M/D/YY in Pacific time.
        </span>
      </label>
      <div className="appointment-date-filter">
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
    </div>
  )
}
