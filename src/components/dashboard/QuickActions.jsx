import DashboardCard from './DashboardCard.jsx'

/**
 * Presentation component for Quick Actions section on Customer Dashboard.
 */
export default function QuickActions({ className = '' }) {
  return (
    <DashboardCard title="Quick Actions" className={className}>
      <div className="flex flex-col space-y-4">
        <a
          href="#edit-profile"
          className="block rounded-lg bg-gray-200 px-6 py-4 text-xl font-extrabold text-gray-900 transition-colors hover:bg-gray-300"
        >
          Edit Profile
        </a>
        <a
          href="/monthlybooking"
          className="block rounded-lg bg-gray-200 px-6 py-4 text-xl font-extrabold text-gray-900 transition-colors hover:bg-gray-300"
        >
          Book an Appointment
        </a>
        <button
          type="button"
          onClick={() => {}}
          className="block w-full rounded-lg bg-gray-200 px-6 py-4 text-left text-xl font-extrabold text-gray-900 transition-colors hover:bg-gray-300"
        >
          Add Vehicle
        </button>
      </div>
    </DashboardCard>
  )
}

