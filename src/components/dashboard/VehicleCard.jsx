import DashboardCard from './DashboardCard.jsx'

/**
 * Presentation component for displaying vehicle information.
 * Wraps content in DashboardCard and accepts vehicle props.
 */
export default function VehicleCard({
  vehicle,
  onViewAll,
  onAddVehicle,
  isLoading = false,
  isAdminView = false,
  className = '',
}) {
  if (isLoading) {
    return (
      <DashboardCard title="My Vehicles" className={className}>
        <div className="animate-pulse space-y-3 py-2" aria-busy="true" aria-label="Loading vehicle details">
          <div className="h-6 w-1/2 rounded bg-gray-200 dark:bg-zinc-700"></div>
          <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-zinc-700"></div>
          <div className="mt-4 h-10 w-32 rounded bg-gray-200 dark:bg-zinc-700"></div>
        </div>
      </DashboardCard>
    )
  }

  if (!vehicle) {
    return (
      <DashboardCard title="My Vehicles" className={className}>
        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
          <p className="text-base font-medium">No registered vehicles found</p>
          <p className="mt-1 text-sm">Add a vehicle to manage service history.</p>
          <button
            type="button"
            onClick={onAddVehicle}
            className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-full bg-[#323232] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323232]"
          >
            Add Vehicle
          </button>
        </div>
      </DashboardCard>
    )
  }

  const { year, make, model, licensePlate, ownerName } = vehicle
  const vehicleTitle = `${year} ${make} ${model}`.trim()

  return (
    <DashboardCard title="My Vehicles" className={className}>
      <div className="flex flex-col space-y-4">
        <div>
          {isAdminView && ownerName && (
            <p className="text-sm font-semibold text-gray-700">
              Owner: {ownerName}
            </p>
          )}
          <h3 className="text-3xl font-extrabold text-gray-900">
            {vehicleTitle}
          </h3>
          {licensePlate && (
            <p className="mt-1 text-lg font-bold text-gray-800">
              License: {licensePlate}
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex cursor-pointer items-center justify-center rounded-full border-2 border-[#323232] bg-[#323232] px-8 py-3 text-base font-extrabold text-white transition-colors hover:bg-black"
          >
            View All Vehicles
          </button>
        </div>
      </div>
    </DashboardCard>
  )
}

