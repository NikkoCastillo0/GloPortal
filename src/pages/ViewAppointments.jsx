import Header from '../components/home/Header.jsx'
import AppointmentFilters from '../components/viewAppointments/AppointmentFilters.jsx'
import AppointmentPagination from '../components/viewAppointments/AppointmentPagination.jsx'
import AppointmentTable from '../components/viewAppointments/AppointmentTable.jsx'

export default function ViewAppointments() {
    return (
        <>
            <Header
                role="customer"
                isHome={true}
                isSignedIn={true}
            />

            <main>
                <h1>View All Appointment Records</h1>
                <button>This is a button!</button>

                <AppointmentFilters />

                <AppointmentPagination />

                <AppointmentTable />
            </main>
        </>
    )
}