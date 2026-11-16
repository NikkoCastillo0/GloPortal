import DashboardCard from './DashboardCard.jsx'

/**
 * Presentation component for displaying the next appointment details.
 * Wraps content in DashboardCard and accepts appointment props.
 */
export default function NextAppointmentCard({
  appointment,
  onViewDetails,
  isLoading = false,
  isAdminView = false,
  className = '',
}) {
  if (isLoading) {
    return (
      <DashboardCard title="Next Appointment" className={className}>
        <div className="animate-pulse space-y-3 py-2" aria-busy="true" aria-label="Loading next appointment details">
          <div className="h-6 w-1/2 rounded bg-gray-200 dark:bg-zinc-700"></div>
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-zinc-700"></div>
          <div className="mt-4 h-10 w-32 rounded bg-gray-200 dark:bg-zinc-700"></div>
        </div>
      </DashboardCard>
    )
  }

  if (!appointment) {
    return (
      <DashboardCard title="Next Appointment" className={className}>
        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
          <p className="text-base font-medium">No upcoming appointments</p>
          <p className="mt-1 text-sm">Schedule your next service with Garage Glo.</p>
          <a
            href="/monthlybooking"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[#323232] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323232]"
          >
            Book Appointment
          </a>
        </div>
      </DashboardCard>
    )
  }

  const { serviceName, date, time, customerName, status } = appointment

  return (
    <DashboardCard title="Next Appointment" className={className}>
      <div className="flex flex-col space-y-4">
        <div>
          {isAdminView && customerName && (
            <p className="text-sm font-semibold text-gray-700">
              Customer: {customerName}
            </p>
          )}
          <h3 className="text-3xl font-extrabold text-gray-900">
            {serviceName}
          </h3>
          <p className="mt-1 text-lg font-bold text-gray-800">
            {date} - {time}
          </p>
          {status && (
            <span className="mt-2 inline-block rounded-full bg-gray-200 px-4 py-1 text-sm font-bold text-gray-900">
              {status}
            </span>
          )}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onViewDetails}
            className="inline-flex cursor-pointer items-center justify-center rounded-full border-2 border-[#323232] bg-[#323232] px-8 py-3 text-base font-extrabold text-white transition-colors hover:bg-black"
          >
            View Details
          </button>
        </div>
      </div>
    </DashboardCard>
  )
}

