import { FormField, SelectInput, TextInput, TextArea, AdminFormActions} from "../admin/AdminFormControls.jsx"

export default function AppointmentForm({
    values,
    onChange,
    customers = [],
    vehicles = [],
    services = [],
    times = [],
    onCancel,
    onSubmit,
    submitLabel,
}) {
    return(
        <form
            onSubmit={onSubmit}
            className="overflow-hidden rounded-xl border border-[#dedede] bg-white shadow-sm"
        >
            <div className="grid min-w-0 grid-cols-1 gap-4 p-4 sm:p-6">
                <FormField label="Customer" htmlFor="customerId" required>
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
          <FormField label="Date" htmlFor="date" required>
            <TextInput
              id="date"
              name="date"
              type="date"
              value={values.date}
              onChange={onChange}
              required
            />
          </FormField>

          <FormField label="Available time" htmlFor="time" required>
            <SelectInput
              id="time"
              name="time"
              value={values.time}
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

        <FormField label="Appointment status" htmlFor="status" required>
          <SelectInput
            id="status"
            name="status"
            value={values.status}
            onChange={onChange}
            required
          >
            <option value="">Select a status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="denied">Denied</option>
            <option value="completed">Completed</option>
          </SelectInput>
        </FormField>

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