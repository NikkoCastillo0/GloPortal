import { CalendarDays, Car, ChevronRight, LayoutDashboard, Plus, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { customerNavigationItems } from '../../config/customerNavigationItems.js'

const icons = {
  dashboard: LayoutDashboard,
  'next-appointment': CalendarDays,
  vehicles: Car,
  booking: CalendarDays,
  'add-vehicle': Plus,
  profile: UserRound,
}

export default function CustomerNavigationLinks({ items = customerNavigationItems, onNavigate }) {
  return items.map(({ id, label, to }) => {
    const Icon = icons[id]
    const content = (
      <>
        {Icon && <Icon aria-hidden="true" className="size-5 shrink-0 md:hidden" />}
        <span className="min-w-0 flex-1 whitespace-normal">
          <span className="block">{label}</span>
          {!to && <span className="block text-xs font-normal leading-4">Coming soon</span>}
        </span>
        {to && <ChevronRight aria-hidden="true" className="size-[18px] shrink-0 text-[#717171] md:hidden" />}
      </>
    )

    return to ? (
      <NavLink key={id} to={to} end onClick={onNavigate} className="flex items-center gap-3">
        {content}
      </NavLink>
    ) : (
      <span
        key={id}
        aria-disabled="true"
        className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-[15px] text-[#717171] md:rounded-lg md:px-4 md:py-1"
      >
        {content}
      </span>
    )
  })
}
