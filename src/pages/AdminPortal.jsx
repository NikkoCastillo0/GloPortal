import AdminDashboard from '../components/adminDashboard/AdminDashboard.jsx'
import Header from '../components/layout/Header.jsx'

export default function AdminPortal() {
  return (
    <div className="min-h-screen bg-[#f6f6f4] text-[#323232] md:bg-white">
      <Header role="admin" isSignedIn={true} showNavigation={true} />
      <AdminDashboard />
    </div>
  )
}
