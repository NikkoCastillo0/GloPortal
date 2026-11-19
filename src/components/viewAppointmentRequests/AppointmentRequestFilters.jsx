import AdminSearchInput from '../admin/AdminSearchInput.jsx'
import { SelectInput } from '../admin/AdminFormControls.jsx'

const filterOptions = [
  { value: 'date', label: 'Filter by date' },
  { value: 'az', label: 'A-Z' },
  { value: 'za', label: 'Z-A' },
]

export default function AppointmentRequestFilters({
  value,
  onChange,
  search,
  onSearchChange,
}) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,1.3fr)]">
      <label className="block min-w-0">
        <span className="sr-only">Sort appointment requests</span>
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
        label="Search appointment requests"
        placeholder="Search requests..."
        title="Search customers, vehicles, services, or notes"
        value={search}
        onChange={onSearchChange}
        helpText="Search appointment requests by customer, vehicle, service, or notes."
      />
    </div>
  )
}