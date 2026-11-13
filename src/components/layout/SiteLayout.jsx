import { Outlet } from 'react-router-dom'
import Footer from './Footer.jsx'

export default function SiteLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
