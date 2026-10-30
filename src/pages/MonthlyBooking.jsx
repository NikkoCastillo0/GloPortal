
import MonthlyBookingLayout from '../components/monthlyBooking/MonthlyBookingLayout.jsx'
import CalendarPreview from '../components/home/CalendarPreview.jsx'
import Header from '../components/layout/Header.jsx'
import './MonthlyBooking.css'

export default function MonthlyBooking() {
  return (
    <MonthlyBookingLayout header={<Header role="customer" showNavigation />}>
      <CalendarPreview />
    </MonthlyBookingLayout>
  )
}
