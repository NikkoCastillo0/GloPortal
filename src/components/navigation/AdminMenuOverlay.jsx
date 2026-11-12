import { useId } from "react";
import { Dialog } from "@base-ui/react/dialog";
import dashboardIcon from "../../assets/navigation/admin-menu/layout-dashboard.svg";
import appointmentsIcon from "../../assets/navigation/admin-menu/calendar-days.svg";
import customersIcon from "../../assets/navigation/admin-menu/users.svg";
import signOutIcon from "../../assets/navigation/admin-menu/log-out.svg";
import chevronIcon from "../../assets/navigation/admin-menu/chevron-right.svg";

const menuItems = [
  { label: "Dashboard", icon: dashboardIcon },
  { label: "Appointments", icon: appointmentsIcon },
  { label: "Customers", icon: customersIcon },
  { label: "Sign out", icon: signOutIcon },
];

/**
 * GP-263 visual shell only. The parent controls visibility. Header selection,
 * dismissal, logout, and destination wiring belong to GP-35/211/212/213.
 * Supply functional menu content as children when those integrations are ready.
 */
export default function AdminMenuOverlay({ isOpen, onClose, id, children }) {
  const generatedId = useId();

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-90 bg-black/40" />
        <Dialog.Popup
          id={id ?? generatedId}
          aria-describedby={undefined}
          className="
            fixed right-0 top-0 z-100 flex h-dvh w-83w-full
            flex-col gap-6 overflow-y-auto overscroll-contain rounded-l-[24px]
            bg-white p-6.5 pt-6 pr-5.5 font-sans
            text-[#242424] shadow-[-10px_0_30px_rgba(0,0,0,0.19)] outline-none
            focus-visible:[outline:2px_solid_#242424] focus-visible:-outline-offset-4
            md:right-4 md:top-4 md:h-118 md:max-h-[calc(100dvh-32px)]
            md:w-127 md:max-w-[calc(100vw-32px)] md:gap-0
            md:rounded-[20px] md:px-11.25 md:pb-14.5 md:pt-3.25
            md:text-black md:shadow-none
          "
        >
          <div className="relative h-14.75 shrink-0 md:h-19.25">
            <Dialog.Title className="text-[34px] font-bold leading-10.25 md:text-[64px] md:font-semibold md:leading-19.25">
              Menu
            </Dialog.Title>
            <p className="mt-0.75 text-xs leading-3.75 tracking-[0.96px] text-[#717171] uppercase md:hidden">
              Admin
            </p>
            <Dialog.Close
              type="button"
              aria-label="Close admin menu"
              className="
                cursor-pointer rounded-full hover:bg-[#ececea]
                focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-[#323232]
                absolute right-0 top-1.5 flex size-11.75 items-center
                justify-center text-[48px]
                font-semibold leading-[normal] text-[#323232]
                text-shadow-[0_4px_4px_rgba(0,0,0,0.25)]
                md:-right-6 md:top-0
              "
            >
              <span aria-hidden="true">X</span>
            </Dialog.Close>
          </div>

          <div className="h-px shrink-0 bg-[#cfcfcd] md:hidden" />

          <nav
            aria-label="Admin navigation"
            className="
              flex shrink-0 flex-col gap-1 text-[21px] font-semibold leading-6.25
              [&>:is(a,button)]:flex [&>:is(a,button)]:w-full
              [&>:is(a,button)]:items-center [&>:is(a,button)]:gap-3
              [&>:is(a,button)]:rounded-[12px] [&>:is(a,button)]:px-3
              [&>:is(a,button)]:py-3.75 [&>:is(a,button)]:text-left
              [&>:is(a,button)]:no-underline
              *:aria-[aria-current=page]:bg-[#ececea]
              md:mt-10.25 md:gap-4.25 md:text-[48px] md:leading-14.5
              md:[&>:is(a,button)]:rounded-none md:[&>:is(a,button)]:p-0
              md:*:aria-[aria-current=page]:bg-transparent
              md:[&>:nth-child(2)]:-ml-px md:[&>:nth-child(3)]:-ml-px
            "
          >
            {children ??
              menuItems.map(({ label, icon }, index) => (
                <button
                  key={label}
                  type="button"
                  disabled
                  aria-current={index === 0 ? "page" : undefined}
                >
                  <img
                    src={icon}
                    alt=""
                    className="size-5 shrink-0 md:hidden"
                  />
                  <span className="min-w-0 flex-1">{label}</span>
                  <img
                    src={chevronIcon}
                    alt=""
                    className="size-4.5 shrink-0 md:hidden"
                  />
                </button>
              ))}
          </nav>

          <div className="shrink-0 rounded-[18px] bg-[#303030] p-3.5 md:hidden">
            <p className="text-[15px] font-bold leading-4.5 text-white">
              Garage Glo
            </p>
            <p className="mt-1 text-xs leading-3.75 text-[#c9f1f4]">
              Salinas, California
            </p>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
