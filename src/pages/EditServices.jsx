import { useState } from 'react'
import { FormField, TextInput, SelectInput, AdminFormActions} from '../components/admin/AdminFormControls.jsx'
import { SAMPLE_SERVICES } from '../mock/servicesMock.js'
import { useNavigate } from 'react-router-dom'
import { AdminPageLayout, AdminPageHeader, } from '../components/admin/AdminPageLayout.jsx'
import Header from '../components/layout/Header.jsx'

export default function EditServices() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ ...SAMPLE_SERVICES[0] })

  function handleServiceChange(event) {
    const selectedService = SAMPLE_SERVICES.find(
      (service) => service.id === event.target.value,
    )

    if (selectedService) {
      setForm({ ...selectedService })
    }
  }

  function handleFieldChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    // UI preview only for now.
    navigate('/viewservices')
  }

  return (
    <AdminPageLayout header={<Header role="admin" isHome={false} />}>
      <AdminPageHeader title="Edit service" />

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-3xl rounded-xl border border-[#dedede] bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid min-w-0 grid-cols-1 gap-4">
          <FormField label="Select a service" htmlFor="serviceId" required>
            <SelectInput
              id="serviceId"
              value={form.id}
              onChange={handleServiceChange}
              required
            >
              {SAMPLE_SERVICES.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Description" htmlFor="description">
            <TextInput
              id="description"
              name="description"
              type="text"
              value={form.description}
              onChange={handleFieldChange}
            />
          </FormField>

          <FormField label="Status" htmlFor="status" required>
            <SelectInput
              id="status"
              name="status"
              value={form.status}
              onChange={handleFieldChange}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectInput>
          </FormField>

          <FormField
            label="Duration (minutes)"
            htmlFor="duration_minutes"
            required
          >
            <TextInput
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              min="1"
              value={form.duration_minutes}
              onChange={handleFieldChange}
              required
            />
          </FormField>

          <FormField label="Cost (USD)" htmlFor="price" required>
            <TextInput
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleFieldChange}
              required
            />
          </FormField>
        </div>

        <AdminFormActions
          onCancel={() => navigate('/viewservices')}
          submitLabel="Save changes"
          className="mt-6"
        />
      </form>
    </AdminPageLayout>
  )
}