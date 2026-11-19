import AdminSearchInput from '../admin/AdminSearchInput.jsx'
import { SelectInput } from '../admin/AdminFormControls.jsx'

const filterOptions = [
  { value: 'date', label: 'Filter by date' },
  { value: 'az', label: 'A-Z' },
  { value: 'za', label: 'Z-A' },
  { value: 'most-jobs', label: 'Most jobs' },
  { value: 'least-jobs', label: 'Least jobs' },
]

export default function AppointmentFilters({
  value,
  onChange,
  date,
  onDateChange,
  search,
  onSearchChange,
}) {
  return (
    <div className="box-border grid w-full min-w-0 max-w-full grid-cols-1 gap-3 lg:grid-cols-[minmax(13rem,0.8fr)_minmax(11rem,0.8fr)_minmax(16rem,1.4fr)]">
      <div className="w-full min-w-0">
        <label
          htmlFor="appointment-date"
          className="mb-1.5 block text-sm font-semibold text-[#323232] lg:sr-only"
        >
          Appointment date
        </label>

       <div className="box-border flex h-11 w-full min-w-0 max-w-full items-center overflow-hidden rounded-lg border border-[#cccccc] bg-white">
        <input
          id="appointment-date"
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          className="appointment-date-input box-border block h-full w-full min-w-0 max-w-full border-0 bg-transparent px-3.5 text-left text-base text-[#242424]"
          style={{ width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}
        />
      </div>

        <p className="mt-1 hidden text-xs text-[#717171] lg:block">
          Format: MM/DD/YYYY
        </p>
      </div>

      <label className="block min-w-0">
        <span className="sr-only">Sort appointments</span>
        <SelectInput
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectInput>
      </label>

      <AdminSearchInput
        label="Search appointments"
        placeholder="Contains"
        title="Search name, email, phone or date (YYYY-MM-DD or M/D/YY)"
        value={search}
        onChange={onSearchChange}
        helpText="Search name, email or phone. Dates use YYYY, YYYY-MM, YYYY-MM-DD or M/D/YY in Pacific time."
      />
    </div>
  )
}