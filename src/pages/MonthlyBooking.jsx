import MonthlyBookingLayout from '../components/monthlyBooking/MonthlyBookingLayout.jsx'
import './MonthlyBooking.css'

export default function MonthlyBooking() {
  return (
    // GP-247: supply the shared homepage Header through the layout's header prop.
    <MonthlyBookingLayout>
      {/* GP-246: replace this placeholder with the reusable homepage calendar. */}
      <p className="monthly-booking__placeholder">
        The monthly appointment calendar is coming soon.
      </p>
    </MonthlyBookingLayout>
  )
}
