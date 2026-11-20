import {
  FormField,
  SelectInput,
  TextInput,
  TextArea,
  AdminFormActions,
} from '../admin/AdminFormControls.jsx'
import AdminStatusBadge from '../admin/AdminStatusBadge.jsx'

export default function AppointmentRequestForm({
  values,
  onChange,
  customers = [],
  vehicles = [],
  services = [],
  times = [],
  status,
  onCancel,
  onSubmit,
  submitLabel = 'Submit request',
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-xl border border-[#dedede] bg-white shadow-sm"
    >
    <div className="flex flex-row flex-wrap gap-2 md:flex-col md:items-stretch">        <FormField label="Customer" htmlFor="customerId" required>
          <SelectInput
            id="customerId"
            name="customerId"
            value={values.customerId}
            onChange={onChange}
            required
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Vehicle" htmlFor="vehicleId" required>
          <SelectInput
            id="vehicleId"
            name="vehicleId"
            value={values.vehicleId}
            onChange={onChange}
            required
          >
            <option value="">Select a vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.label}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Service" htmlFor="serviceId" required>
          <SelectInput
            id="serviceId"
            name="serviceId"
            value={values.serviceId}
            onChange={onChange}
            required
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Requested date" htmlFor="requestedDate" required>
            <TextInput
              id="requestedDate"
              name="requestedDate"
              type="date"
              value={values.requestedDate}
              onChange={onChange}
              required
            />
          </FormField>

          <FormField label="Requested time" htmlFor="requestedTime" required>
            <SelectInput
              id="requestedTime"
              name="requestedTime"
              value={values.requestedTime}
              onChange={onChange}
              required
            >
              <option value="">Select a time</option>
              {times.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        {status && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#323232]">Status:</span>
            <AdminStatusBadge status={status} />
          </div>
        )}

        <FormField label="Notes" htmlFor="notes">
          <TextArea
            id="notes"
            name="notes"
            value={values.notes}
            onChange={onChange}
            placeholder="Add notes (optional)"
            rows={4}
          />
        </FormField>

        <AdminFormActions
          onCancel={onCancel}
          submitLabel={submitLabel}
        />
      </div>
    </form>
  )
}