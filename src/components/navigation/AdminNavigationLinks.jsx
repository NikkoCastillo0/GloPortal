import { CalendarDays, ChevronRight, ClipboardList, LayoutDashboard, Package, Wrench } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { adminNavigationItems } from '../../config/adminNavigationItems.js'

const icons = {
  dashboard: LayoutDashboard,
  requests: ClipboardList,
  appointments: CalendarDays,
  inventory: Package,
  services: Wrench,
}

export default function AdminNavigationLinks({ onNavigate }) {
  return adminNavigationItems.map(({ id, label, to }) => {
    const Icon = icons[id]

    return (
      <NavLink key={id} to={to} end onClick={onNavigate} className="flex items-center gap-3">
        <Icon aria-hidden="true" className="size-5 shrink-0 md:hidden" />
        <span className="min-w-0 flex-1 whitespace-normal">{label}</span>
        <ChevronRight aria-hidden="true" className="size-[18px] shrink-0 text-[#717171] md:hidden" />
      </NavLink>
    )
  })
}
