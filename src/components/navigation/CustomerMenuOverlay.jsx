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
        <Dialog.Backdrop className="fixed inset-0 z-[90] bg-black/40" />
        <Dialog.Popup
          id={id ?? generatedId}
          finalFocus={returnFocusRef}
          aria-describedby={undefined}
          className="
            fixed right-0 top-0 z-[100] flex h-dvh w-[332px] max-w-full
            flex-col gap-6 overflow-y-auto overscroll-contain
            rounded-l-[24px] bg-white pb-[26px] pl-[26px] pr-[22px] pt-6
            font-sans text-[#242424] shadow-[-10px_0_30px_rgba(0,0,0,0.19)]
            outline-none
            md:right-4 md:top-4 md:box-border md:h-[237px] md:max-h-[calc(100dvh-32px)]
            md:w-72
            md:max-w-[calc(100vw-32px)] md:gap-0 md:rounded-2xl
            md:p-6 md:shadow-2xl
          "
        >
          <div className="relative h-[59px] shrink-0 md:h-[53px] md:border-b md:border-gray-200 md:pb-4">
            <Dialog.Title className="text-[34px] font-bold leading-[41px] md:flex md:h-9 md:items-center md:text-xl md:leading-7 md:text-black">
              Menu
            </Dialog.Title>
            <p className="mt-[3px] text-xs leading-[15px] tracking-[0.96px] text-[#717171] uppercase md:hidden">
              Customer
            </p>
            <Dialog.Close
              aria-label="Close customer menu"
              className="
                absolute right-0 top-[6px] flex size-[47px] cursor-pointer
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
            aria-label="Customer navigation"
            className="
              flex shrink-0 flex-col gap-1 text-[21px] font-semibold leading-[25px]
              [&>:is(a,button)]:rounded-xl [&>:is(a,button)]:px-3
              [&>:is(a,button)]:py-[15px] [&>:is(a,button)]:text-left
              [&>:is(a,button)]:no-underline
              [&>:is(a,button):hover]:bg-[#ececea]
              [&>:is(a,button):focus-visible]:outline-2
              [&>:is(a,button):focus-visible]:outline-offset-[-2px]
              [&>:is(a,button):focus-visible]:outline-[#323232]
              [&>[aria-current=page]]:bg-[#ececea]
              md:mt-6 md:gap-0 md:whitespace-nowrap md:text-lg md:leading-7
              md:text-black md:[&>:is(a,button)]:p-0
              md:[&>:is(a,button)]:rounded-lg md:[&>:is(a,button)]:px-4
              md:[&>[aria-current=page]]:bg-transparent
            "
          >
            {children}
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
