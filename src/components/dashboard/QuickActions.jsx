import DashboardCard from './DashboardCard.jsx'
import { customerQuickActions } from '../../config/customerQuickActions.js'

const actions = [
  { id: 'editProfile', label: 'Edit Profile', visibility: 'block' },
  { id: 'bookAppointment', label: 'Book Appointment', visibility: 'block' },
  { id: 'addVehicle', label: 'Add Vehicle', visibility: 'hidden md:block' },
  { id: 'editVehicles', label: 'Edit Vehicles', visibility: 'block md:hidden' },
]

const actionStyles = 'w-full rounded-lg bg-gray-200 px-6 py-4 text-left text-xl font-extrabold text-gray-900 transition-colors'

/**
 * Presentation component for Quick Actions section on Customer Dashboard.
 */
export default function QuickActions({ className = '' }) {
  return (
    <DashboardCard title="Quick Actions" className={className}>
      <div className="flex flex-col gap-4">
        {actions.map(({ id, label, visibility }) => {
          const href = customerQuickActions[id]

          return href ? (
            <a
              key={id}
              href={href}
              className={`${actionStyles} ${visibility} hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323232]`}
            >
              {label}
            </a>
          ) : (
            <button
              key={id}
              type="button"
              disabled
              className={`${actionStyles} ${visibility} cursor-not-allowed`}
            >
              <span className="block">{label}</span>
              <span className="mt-1 block text-xs font-normal leading-4">Coming soon</span>
            </button>
          )
        })}
      </div>
    </DashboardCard>
  )
}
