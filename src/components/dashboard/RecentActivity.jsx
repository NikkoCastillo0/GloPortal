import DashboardCard from './DashboardCard.jsx'

/**
 * Presentation component for Recent Activity feed on Customer Dashboard.
 */
export default function RecentActivity({ activities = [], className = '' }) {
  if (!activities || activities.length === 0) {
    return (
      <DashboardCard title="Recent Activity" className={className}>
        <p className="py-4 text-center text-xl font-bold text-gray-900">
          No recent activity to show.
        </p>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard title="Recent Activity" className={className}>
      <ul className="space-y-4 [overflow-wrap:anywhere]" aria-label="Recent activity history">
        {activities.map((activity) => (
          <li key={activity.id} className="rounded-lg bg-gray-200 p-6">
            <p className="text-xl font-extrabold text-gray-900">
              {activity.title}
            </p>
            {activity.timestamp && (
              <p className="mt-2 text-base font-bold text-gray-800">
                {activity.timestamp}
              </p>
            )}
          </li>
        ))}
      </ul>
    </DashboardCard>
  )
}


