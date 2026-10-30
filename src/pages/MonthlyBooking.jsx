import MonthlyBookingLayout from '../components/monthlyBooking/MonthlyBookingLayout.jsx'
import Header from '../components/layout/Header.jsx'
import './MonthlyBooking.css'

export default function MonthlyBooking() {
  return (
    <MonthlyBookingLayout header={<Header role="customer" showNavigation />}>
      {/* GP-246: replace this placeholder with the reusable homepage calendar. */}
      <p className="monthly-booking__placeholder">
        The monthly appointment calendar is coming soon.
      </p>
    </MonthlyBookingLayout>
  )
}
