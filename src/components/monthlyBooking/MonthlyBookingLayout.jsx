import { ChevronDown } from 'lucide-react'

export default function MonthlyBookingLayout({ header, children }) {
  return (
    <div className="monthly-booking">
      {header}
      <main className="monthly-booking__main" aria-labelledby="monthly-booking-title">
        <div className="monthly-booking__container">
          <h1 id="monthly-booking-title" className="sr-only">
            Monthly Booking
          </h1>
          <section
            className="monthly-booking__calendar"
            aria-label="Monthly appointment calendar"
          >
            {children}
          </section>
          <section className="monthly-booking__selectors" aria-label="Booking selection">
            <div className="monthly-booking__date-field">
              <label htmlFor="monthly-booking-date">Date</label>
              <div className="monthly-booking__date-control">
                <select id="monthly-booking-date" defaultValue="" disabled>
                  <option value="">Date</option>
                </select>
                <ChevronDown aria-hidden="true" className="monthly-booking__date-chevron" />
              </div>
            </div>
            <button className="monthly-booking__select-time" type="button" disabled>
              Select Time
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}
