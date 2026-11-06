import { cn } from 'cn'

/**
 * Shared wrapper component for dashboard cards, updated for Figma Page 25 visual alignment.
 */
export default function DashboardCard({ title, action, children, className = '' }) {
  return (
    <section 
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm",
        className
      )}
      aria-labelledby={title ? `card-title-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined}
    >
      {title && (
        <div className="flex items-center justify-between bg-[#323232] px-6 py-4">
          <h2 
            id={`card-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-2xl font-bold text-white"
          >
            {title}
          </h2>
          {action && <div className="ml-4">{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </section>
  )
}

