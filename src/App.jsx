
import Homepage from './pages/Homepage.jsx'
import ViewAppointments from './pages/ViewAppointments.jsx'
import EditAppointment from './pages/EditAppointment.jsx'
import Login from './pages/Login.jsx'
import MonthlyBooking from './pages/MonthlyBooking.jsx'

export default function App() {
    const path = window.location.pathname

    if (path === '/login' || path === '/login/') {
        return <Login />
    }
    if (path === '/booking' || path === '/booking/') {
        return <MonthlyBooking />
    }

    if (
        path === '/appointments/edit' ||
        path === '/appointments/edit/' ||
        /^\/appointments\/[^/]+\/edit\/?$/.test(path)
    ) {
        return <EditAppointment />
    }

    if (path === '/appointments' || path === '/appointments/') {
        return <ViewAppointments />
    }

    return <Homepage />
}
