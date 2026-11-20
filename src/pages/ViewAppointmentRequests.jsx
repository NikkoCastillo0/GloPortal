import Header from '../components/layout/Header.jsx'
import {useState} from 'react'
import {AdminPageLayout,AdminPageHeader,} from '../components/admin/AdminPageLayout.jsx'
import AppointmentRequestFilters from "../components/viewAppointmentRequests/AppointmentRequestFilters.jsx"
import AppointmentRequestTable from '../components/viewAppointmentRequests/AppointmentRequestTable.jsx'
import {Link, useNavigate} from 'react-router-dom'



export default function ViewAppointmentRequests() {
    const navigate = useNavigate()
    const[filter, setFilter] = useState('date')
    const[search, setSearch] = useState('')
    const requests = [
        {
            id: '1',
            requested_at: '2026-10-03T10:00:00-07:00',
            customer_name: 'Nikko Castillo',
            email: "NikkosGenericEmail@gmail.com",
            phone: '(831) 123-4567',
            vehicle: '1989 BMW 325is',
            price_cents: 12999,
            notes: 'New tires (4).',
            status: 'pending',
        },
        {
            id: '2',
            requested_at: '2026-10-05T13:00:00-07:00',
            customer_name: 'Tobi Flores',
            email: 'tobi.flores@yahoo.com',
            phone: '(415) 555-0287',
            vehicle: '2019 Honda Civic',
            service_name: 'Tire patch',
            price_cents: 2999,
            notes: 'Slow leak in rear tire.',
            status: 'pending',
        },
    ]
  return (
    <AdminPageLayout header={<Header role="admin" isHome={false} />}>
        <AdminPageHeader
        title="Appointment Requests"
        description="Review pending appointment requests and accept or deny each one."
        action={
            <Link
                to="/createappointmentrequest"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#323232] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#484848]"
            >
                Manually create appointment
            </Link>
        }
        />

        <AppointmentRequestFilters
        value={filter}
        onChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        />

        <section
        aria-label="Appointment requests"
        className="mt-5 min-w-0"
        >
            <AppointmentRequestTable 
                requests={requests}
                onEdit={(request) =>
                    navigate(`/editappointmentrequest?id=${encodeURIComponent(request.id)}`)
                } 
            />
        </section>
    </AdminPageLayout>
  )
}