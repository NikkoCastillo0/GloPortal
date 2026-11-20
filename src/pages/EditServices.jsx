import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import {
  AdminPageLayout,
  AdminPageHeader,
} from '../components/admin/AdminPageLayout.jsx'
import {
  FormField,
  TextInput,
  SelectInput,
  AdminFormActions,
} from '../components/admin/AdminFormControls.jsx'

const SAMPLE_SERVICES = [
  {
    id: 'tire-mount-balance',
    name: 'Tire Mount and Balance',
    description: 'Tire mounting and balancing for a smoother ride.',
    duration_minutes: 60,
    price: 25,
    status: 'active',
  },
  {
    id: 'tire-plug-patch',
    name: 'Tire Plug/Patch',
    description: 'Repair for safely repairable tire punctures.',
    duration_minutes: 45,
    price: 20,
    status: 'active',
  },
  {
    id: 'wheel-balancing',
    name: 'Wheel Balancing',
    description: 'Correct uneven wheel weight distribution.',
    duration_minutes: 45,
    price: 15,
    status: 'active',
  },
  {
    id: 'tpms-service',
    name: 'TPMS Service',
    description: 'Inspection and service for tire pressure sensors.',
    duration_minutes: 45,
    price: 30,
    status: 'active',
  },
  {
    id: 'tire-rotation',
    name: 'Tire Rotation',
    description: 'Rotate tires to support even tread wear.',
    duration_minutes: 30,
    price: 20,
    status: 'active',
  },
  {
    id: 'flat-tire-inspection',
    name: 'Flat Tire Inspection',
    description: 'Inspect a flat tire and assess repair options.',
    duration_minutes: 20,
    price: 10,
    status: 'inactive',
  },
  {
    id: 'seasonal-tire-change',
    name: 'Seasonal Tire Change',
    description: 'Swap a vehicle between seasonal tire sets.',
    duration_minutes: 60,
    price: 40,
    status: 'active',
  },
  {
    id: 'tire-disposal',
    name: 'Tire Disposal',
    description: 'Responsible disposal of an old tire.',
    duration_minutes: 15,
    price: 5,
    status: 'inactive',
  },
]

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