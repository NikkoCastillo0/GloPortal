import AdminSearchInput from '../admin/AdminSearchInput.jsx'
import { SelectInput, TextInput } from '../admin/AdminFormControls.jsx'

const filterOptions = [
  { value: 'date', label: 'Newest to oldest' },
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
    <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(13rem,0.8fr)_minmax(11rem,0.8fr)_minmax(16rem,1.4fr)]">
      <div className="min-w-0">
        <label htmlFor="appointment-date" className="sr-only">
          Appointment date (Pacific time)
        </label>
        <TextInput
          id="appointment-date"
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />
        {date && (
          <button
            type="button"
            className="mt-1 text-sm font-medium text-[#555] underline underline-offset-2"
            onClick={() => onDateChange('')}
          >
            Clear date
          </button>
        )}
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