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
import ShopAvailability from './pages/ShopAvailability.jsx'
import RouteAccess from './components/auth/RouteAccess.jsx'
import {CreateAppointment} from './pages/CreateAppointment.jsx'
import ViewServices from './pages/ViewServices.jsx'
import AddServices from './pages/AddServices.jsx'
import CreateAppointmentRequest from './pages/CreateAppointmentRequest.jsx'
import EditAppointmentRequest from './pages/EditAppointmentRequest.jsx'


const router = createBrowserRouter([
    {path: "/", element: <Homepage />},
    {path: "/login", element: <RouteAccess key="login"><Login /></RouteAccess>},
    {path: "/signup", element: <SignUp />},
    {path: "/customerportal", element: <CustomerPortal />},
    {path: "/adminportal", element: <AdminPortal />},
    {path: "/viewappointments", element: <ViewAppointments />},
    {path: "/editappointment", element: <EditAppointment />},
    {path: "/monthlybooking", element: <MonthlyBooking />},
    {path: "/viewservices", element: <ViewServices />},
    {path: "/addservices", element: <AddServices />},
    {path: "/editservices", element: <EditServices />},
    {path: "/viewcustomers", element: <ViewCustomers />},
    {path: "/viewinventory", element: <ViewInventory />},
    {path: "/viewvehicle", element: <ViewVehicle />},
    {path: "/addvehicle", element: <AddVehicle />},
    {path: "/editprofile", element: <RouteAccess requiredRole="customer"><EditProfile /></RouteAccess>},
    {path: "/shopavailability", element: <ShopAvailability />},
    {path: "/createappointment", element: <CreateAppointment />},
    {path: "/createappointmentrequest", element: <CreateAppointmentRequest />},
    {path: "/editappointmentrequest", element: <EditAppointmentRequest />},


    {path: "/viewappointmentrequests", element: <ViewAppointmentRequests />},
    {path: "/privacy-policy", element: <PrivacyPolicy />},
    {path: "/terms-of-service", element: <TermsOfService />}

  ])

export default function App() {
    return <RouterProvider router={router} />;
}
