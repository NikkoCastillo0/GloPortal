import MonthlyBookingLayout from '../components/monthlyBooking/MonthlyBookingLayout.jsx'
import CalendarPreview from '../components/home/CalendarPreview.jsx'
import './MonthlyBooking.css'

export default function MonthlyBooking() {
  return (
    // GP-247: supply the shared homepage Header through the layout's header prop.
    <MonthlyBookingLayout>
      <CalendarPreview />
    </MonthlyBookingLayout>
  )
}
