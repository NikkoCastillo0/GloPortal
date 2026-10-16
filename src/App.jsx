
import Homepage from './pages/Homepage.jsx'
import ViewAppointments from './pages/ViewAppointments.jsx'
import EditAppointment from './pages/EditAppointment.jsx'

export default function App() {
    const path = window.location.pathname

    if (/^\/appointments\/[^/]+\/edit\/?$/.test(path)) {
        return <EditAppointment />
    }

    if (path === '/appointments' || path === '/appointments/') {
        return <ViewAppointments />
    }

    return <Homepage />
}
