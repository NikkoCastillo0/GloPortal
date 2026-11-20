import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import {
  AdminPageLayout,
  AdminPageHeader,
} from '../components/admin/AdminPageLayout.jsx'
import AppointmentRequestForm from '../components/viewAppointmentRequests/AppointmentRequestForm.jsx'

const customers = [
  { id: '1', name: 'Nikko Castillo' },
  { id: '2', name: 'Tobi Flores' },
]

const vehicles = [
  { id: '1', label: '1989 BMW 325is' },
  { id: '2', label: '2019 Honda Civic' },
]

const services = [
  { id: '1', name: 'Tire install and balance' },
  { id: '2', name: 'Tire patch' },
]

const times = ['9:00 AM', '10:00 AM', '1:00 PM', '2:00 PM']

const requestToEdit = {
  customerId: '1',
  vehicleId: '1',
  serviceId: '1',
  requestedDate: '2026-10-03',
  requestedTime: '10:00 AM',
  notes: 'New tires (4). Please confirm availability.',
}

export default function EditAppointmentRequest() {
  const navigate = useNavigate()
  const [values, setValues] = useState(requestToEdit)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    // UI only for now; saving changes will be connected later.
  }

  return (
    <AdminPageLayout header={<Header role="admin" isHome={false} />}>
      <AdminPageHeader
        title="Edit appointment request"
        description="Update the details for this appointment request."
      />

      <AppointmentRequestForm
        values={values}
        onChange={handleChange}
        customers={customers}
        vehicles={vehicles}
        services={services}
        times={times}
        status="pending"
        onCancel={() => navigate(-1)}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </AdminPageLayout>
  )
}