import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import SiteLayout from './components/layout/SiteLayout.jsx'
import Homepage from './pages/Homepage.jsx'
import ViewAppointments from './pages/ViewAppointments.jsx'
import EditAppointment from './pages/EditAppointment.jsx'
import Login from './pages/Login.jsx'
import MonthlyBooking from './pages/MonthlyBooking.jsx'
import SignUp from "./pages/SignUp.jsx"
import CustomerPortal from './pages/CustomerPortal.jsx'
import AdminPortal from './pages/AdminPortal.jsx'

const router = createBrowserRouter([
    {
        element: <SiteLayout />,
        children: [
            {path: "/", element: <Homepage />},
            {path: "/login", element: <Login />},
            {path: "/signup", element: <SignUp />},
            {path: "/customerportal", element: <CustomerPortal />},
            {path: "/adminportal", element: <AdminPortal />},
            {path: "/viewappointments", element: <ViewAppointments />},
            {path: "/editappointment", element: <EditAppointment />},
            {path: "/monthlybooking", element: <MonthlyBooking />}
        ],
    },
])

export default function App() {
    return <RouterProvider router={router} />;
}
