import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import {
  AdminPageLayout,
  AdminPageHeader,
} from '../components/admin/AdminPageLayout.jsx'
import AppointmentRequestForm from '../components/viewAppointmentRequests/AppointmentRequestForm.jsx'

const initialValues = {
  customerId: '',
  vehicleId: '',
  serviceId: '',
  requestedDate: '',
  requestedTime: '',
  notes: '',
}

// Temporary options for the UI. These can later come from your data source.
const customers = [
  { id: '1', name: 'Nikko Castillo' },
  { id: '2', name: 'Tobi Flores' },
]

const vehicles = [
  { id: '1', label: '2022 Toyota Tacoma' },
  { id: '2', label: '2019 Honda Civic' },
]

const services = [
  { id: '1', name: 'Tire install and balance' },
  { id: '2', name: 'Tire patch' },
]

const times = ['9:00 AM', '10:00 AM', '1:00 PM', '2:00 PM']

export default function CreateAppointmentRequest() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    // UI only for now; saving the request will be connected later.
  }

  return (
    <AdminPageLayout header={<Header role="admin" isHome={false} />}>
      <AdminPageHeader title="Add appointment request" />

      <AppointmentRequestForm
        values={values}
        onChange={handleChange}
        customers={customers}
        vehicles={vehicles}
        services={services}
        times={times}
        onCancel={() => navigate(-1)}
        onSubmit={handleSubmit}
        submitLabel="Submit request"
      />
    </AdminPageLayout>
  )
}