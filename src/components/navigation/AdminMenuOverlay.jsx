import { useId } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import dashboardIcon from '../../assets/navigation/admin-menu/layout-dashboard.svg'
import appointmentsIcon from '../../assets/navigation/admin-menu/calendar-days.svg'
import customersIcon from '../../assets/navigation/admin-menu/users.svg'
import signOutIcon from '../../assets/navigation/admin-menu/log-out.svg'
import chevronIcon from '../../assets/navigation/admin-menu/chevron-right.svg'

const menuItems = [
  { label: 'Dashboard', icon: dashboardIcon },
  { label: 'Appointments', icon: appointmentsIcon },
  { label: 'Customers', icon: customersIcon },
  { label: 'Sign out', icon: signOutIcon },
]

/**
 * GP-263 visual shell only. The parent controls visibility. Header selection,
 * dismissal, logout, and destination wiring belong to GP-35/211/212/213.
 * Supply functional menu content as children when those integrations are ready.
 */
export default function AdminMenuOverlay({ isOpen, id, children }) {
  const generatedId = useId()

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[90] bg-black/40" />
        <Dialog.Popup
          id={id ?? generatedId}
          aria-describedby={undefined}
          className="
            fixed right-0 top-0 z-[100] flex h-dvh w-[332px] max-w-full
            flex-col gap-6 overflow-y-auto overscroll-contain rounded-l-[24px]
            bg-white pb-[26px] pl-[26px] pr-[22px] pt-6 font-sans
            text-[#242424] shadow-[-10px_0_30px_rgba(0,0,0,0.19)] outline-none
            focus-visible:[outline:2px_solid_#242424] focus-visible:-outline-offset-4
            md:right-4 md:top-4 md:h-[472px] md:max-h-[calc(100dvh-32px)]
            md:w-[508px] md:max-w-[calc(100vw-32px)] md:gap-0
            md:rounded-[20px] md:px-[45px] md:pb-[58px] md:pt-[13px]
            md:text-black md:shadow-none
          "
        >
          <div className="relative h-[59px] shrink-0 md:h-[77px]">
            <Dialog.Title className="text-[34px] font-bold leading-[41px] md:text-[64px] md:font-semibold md:leading-[77px]">
              Menu
            </Dialog.Title>
            <p className="mt-[3px] text-xs leading-[15px] tracking-[0.96px] text-[#717171] uppercase md:hidden">
              Admin
            </p>
            <button
              type="button"
              disabled
              aria-label="Close admin menu"
              className="
                absolute right-0 top-[6px] flex size-[47px] items-center
                justify-center overflow-hidden text-center text-[48px]
                font-semibold leading-[normal] text-[#323232]
                text-shadow-[0_4px_4px_rgba(0,0,0,0.25)]
                md:right-[-24px] md:top-0
              "
            >
              <span aria-hidden="true">X</span>
            </button>
          </div>

          <div className="h-px shrink-0 bg-[#cfcfcd] md:hidden" />

          <nav
            aria-label="Admin navigation"
            className="
              flex shrink-0 flex-col gap-1 text-[21px] font-semibold leading-[25px]
              [&>:is(a,button)]:flex [&>:is(a,button)]:w-full
              [&>:is(a,button)]:items-center [&>:is(a,button)]:gap-3
              [&>:is(a,button)]:rounded-[12px] [&>:is(a,button)]:px-3
              [&>:is(a,button)]:py-[15px] [&>:is(a,button)]:text-left
              [&>:is(a,button)]:no-underline
              [&>[aria-current=page]]:bg-[#ececea]
              md:mt-[41px] md:gap-[17px] md:text-[48px] md:leading-[58px]
              md:[&>:is(a,button)]:rounded-none md:[&>:is(a,button)]:p-0
              md:[&>[aria-current=page]]:bg-transparent
              md:[&>:nth-child(2)]:-ml-px md:[&>:nth-child(3)]:-ml-px
            "
          >
            {children ?? menuItems.map(({ label, icon }, index) => (
              <button
                key={label}
                type="button"
                disabled
                aria-current={index === 0 ? 'page' : undefined}
              >
                <img src={icon} alt="" className="size-5 shrink-0 md:hidden" />
                <span className="min-w-0 flex-1">{label}</span>
                <img src={chevronIcon} alt="" className="size-[18px] shrink-0 md:hidden" />
              </button>
            ))}
          </nav>

          <div className="shrink-0 rounded-[18px] bg-[#303030] p-[14px] md:hidden">
            <p className="text-[15px] font-bold leading-[18px] text-white">Garage Glo</p>
            <p className="mt-1 text-xs leading-[15px] text-[#c9f1f4]">Salinas, California</p>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
