import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Homepage from './pages/Homepage.jsx'
import ViewAppointments from './pages/ViewAppointments.jsx'
import EditAppointment from './pages/EditAppointment.jsx'
import Login from './pages/Login.jsx'
import MonthlyBooking from './pages/MonthlyBooking.jsx'
import SignUp from "./pages/SignUp.jsx"
import CustomerPortal from './pages/CustomerPortal.jsx'
import AdminPortal from './pages/AdminPortal.jsx'
import EditServices from './pages/EditServices.jsx'
import ViewCustomers from './pages/ViewCustomers.jsx'
import ViewInventory from './pages/ViewInventory.jsx'
import ViewAppointmentRequests from './pages/ViewAppointmentRequests.jsx'
import ViewVehicle from './pages/ViewVehicle.jsx'
import AddVehicle from './pages/AddVehicle.jsx'
import EditProfile from './pages/EditProfile.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import TermsOfService from './pages/TermsOfService.jsx'
import RouteAccess from './components/auth/RouteAccess.jsx'

const router = createBrowserRouter([
    {path: "/", element: <Homepage />},
    {path: "/login", element: <RouteAccess key="login"><Login /></RouteAccess>},
    {path: "/signup", element: <SignUp />},
    {path: "/customerportal", element: <CustomerPortal />},
    {path: "/adminportal", element: <AdminPortal />},
    {path: "/viewappointments", element: <ViewAppointments />},
    {path: "/editappointment", element: <EditAppointment />},
    {path: "/monthlybooking", element: <MonthlyBooking />},
    {path: "/editservices", element: <EditServices />},
    {path: "/viewcustomers", element: <ViewCustomers />},
    {path: "/viewinventory", element: <ViewInventory />},
    {path: "/viewvehicle", element: <ViewVehicle />},
    {path: "/addvehicle", element: <AddVehicle />},
    {path: "/editprofile", element: <EditProfile />},
   

    {path: "/viewappointmentrequests", element: <ViewAppointmentRequests />},
    {path: "/privacy-policy", element: <PrivacyPolicy />},
    {path: "/terms-of-service", element: <TermsOfService />}

  ])

export default function App() {
    return <RouterProvider router={router} />;
}
