import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Homepage from './pages/Homepage.jsx'
import ViewAppointments from './pages/ViewAppointments.jsx'
import EditAppointment from './pages/EditAppointment.jsx'
import Login from './pages/Login.jsx'
import MonthlyBooking from './pages/MonthlyBooking.jsx'
import SignUp from "./pages/SignUp.jsx"
import CustomerPortal from './pages/CustomerPortal.jsx'
import AdminPortal from './pages/AdminPortal.jsx'
import RouteAccess from './components/auth/RouteAccess.jsx'

const router = createBrowserRouter([
    {path: "/", element: <Homepage />},
    {path: "/login", element: <RouteAccess key="login"><Login /></RouteAccess>},
    {path: "/signup", element: <SignUp />},
    {path: "/customerportal", element: <RouteAccess key="customerportal" requiredRole="customer"><CustomerPortal /></RouteAccess>},
    {path: "/adminportal", element: <RouteAccess key="adminportal" requiredRole="admin"><AdminPortal /></RouteAccess>},
    {path: "/viewappointments", element: <RouteAccess key="viewappointments" requiredRole="admin"><ViewAppointments /></RouteAccess>},
    {path: "/editappointment", element: <RouteAccess key="editappointment" requiredRole="admin"><EditAppointment /></RouteAccess>},
    {path: "/monthlybooking", element: <MonthlyBooking />}

  ])

export default function App() {
    return <RouterProvider router={router} />;
}
