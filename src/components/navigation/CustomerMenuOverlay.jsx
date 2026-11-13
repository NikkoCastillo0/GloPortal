import { useId } from 'react'
import { Dialog } from '@base-ui/react/dialog'

/**
 * Controlled customer menu shell. Supply links/actions as children; the parent
 * owns navigation, authentication, and whether a close request changes isOpen.
 */
export default function CustomerMenuOverlay({
  isOpen,
  onClose,
  children,
  id,
  returnFocusRef,
  menuLabel = 'Customer',
}) {
  const generatedId = useId()

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-90 bg-black/40" />
        <Dialog.Popup
          id={id ?? generatedId}
          finalFocus={returnFocusRef}
          aria-describedby={undefined}
          className="
            fixed right-0 top-0 z-100 flex h-dvh w-83 max-w-full
            flex-col gap-6 overflow-y-auto overscroll-contain
            rounded-l-[24px] bg-white p-6.5 pt-6 pr-5.5
            font-sans text-[#242424] shadow-[-10px_0_30px_rgba(0,0,0,0.19)]
            outline-none
            md:right-4 md:top-4 md:box-border md:h-59.25 md:max-h-[calc(100dvh-32px)]
            md:w-72
            md:max-w-[calc(100vw-32px)] md:gap-0 md:rounded-2xl
            md:p-6 md:shadow-2xl
          "
        >
          <div className="relative h-14.75 shrink-0 md:h-13.25 md:border-b md:border-gray-200 md:pb-4">
            <Dialog.Title className="text-[34px] font-bold leading-10.25 md:flex md:h-9 md:items-center md:text-xl md:leading-7 md:text-black">
              Menu
            </Dialog.Title>
            <p className="mt-0.75 text-xs leading-3.75 tracking-[0.96px] text-[#717171] uppercase md:hidden">
              {menuLabel}
            </p>
            <Dialog.Close
              aria-label={`Close ${menuLabel.toLowerCase()} menu`}
              className="
                absolute right-0 top-1.5 flex size-11.75 cursor-pointer
                items-center justify-center rounded-full text-[48px]
                font-semibold leading-none text-[#323232]
                text-shadow-[0_4px_4px_rgba(0,0,0,0.25)]
                hover:bg-[#ececea] focus-visible:outline-2
                focus-visible:outline-offset-2 focus-visible:outline-[#323232]
                md:right-0 md:top-0 md:size-9 md:text-3xl md:font-normal
                md:leading-none md:text-black md:text-shadow-none
              "
            >
              <span aria-hidden="true">X</span>
            </Dialog.Close>
          </div>

          <div className="h-px shrink-0 bg-[#cfcfcd] md:hidden" />

          <nav
            aria-label={`${menuLabel} navigation`}
            className="
              flex shrink-0 flex-col gap-1 text-[21px] font-semibold leading-6.25
              [&>:is(a,button)]:rounded-xl [&>:is(a,button)]:px-3
              [&>:is(a,button)]:py-3.75 [&>:is(a,button)]:text-left
              [&>:is(a,button)]:no-underline
              [&>:is(a,button):hover]:bg-[#ececea]
              [&>:is(a,button):focus-visible]:outline-2
              [&>:is(a,button):focus-visible]:-outline-offset-2
              [&>:is(a,button):focus-visible]:outline-[#323232]
              *:aria-[aria-current=page]:bg-[#ececea]
              md:mt-6 md:gap-0 md:whitespace-nowrap md:text-lg md:leading-7
              md:text-black md:[&>:is(a,button)]:p-0
              md:[&>:is(a,button)]:rounded-lg md:[&>:is(a,button)]:px-4
              md:*:aria-[aria-current=page]:bg-transparent
            "
          >
            {children}
          </nav>

          <div className="shrink-0 rounded-[18px] bg-[#303030] p-3.5 md:hidden">
            <p className="text-[15px] font-bold leading-4.5 text-white">Garage Glo</p>
            <p className="mt-1 text-xs leading-3.75 text-[#c9f1f4]">Salinas, California</p>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
