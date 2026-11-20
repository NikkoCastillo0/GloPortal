import { useId, useState } from 'react'

function ServiceCard({ title, image, description }) {
  const descriptionId = useId()
  const serviceDescription = description?.trim()
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)

  const handleCardClick = () => {
    if (window.matchMedia('(hover: none)').matches) {
      setIsDescriptionOpen((isOpen) => !isOpen)
    }
  }

  return (
    <article className="group box-border flex h-full min-w-0 flex-col gap-3 p-1.5 text-center text-[#323232] [outline:none] focus-visible:rounded-[0.75rem] focus-visible:[outline:3px_solid_#323232] focus-visible:outline-offset-[3px]" 
      tabIndex={0} 
      aria-describedby={descriptionId} 
      onClick={handleCardClick}
      aria-expanded={isDescriptionOpen}>
      <div className="relative aspect-[894/414] w-full flex-none overflow-hidden rounded-[5px] border-2 border-solid border-[#323232] [background:var(--code-bg,#f4f3ec)] [box-shadow:4px_4px_6px_rgb(0_0_0_/_20%)]">
        {image ? (
          <img className="block h-full w-full object-cover" src={image} alt="" />
        ) : (
          <div className="box-border grid h-full w-full place-items-center p-4 text-center text-[0.875rem] text-[#323232]">
            Service image unavailable
          </div>
        )}
        <div
          className={`absolute inset-0 box-border flex flex-col items-start justify-center gap-[clamp(8px,1.4vw,14px)] overflow-y-auto bg-[linear-gradient(to_top,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.46)_55%,rgba(0,0,0,0.12)_100%)] p-[clamp(12px,2.2vw,24px)] text-left text-white opacity-0 transition-opacity duration-500 ease-in-out [@media(hover:hover)]:group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none ${
            isDescriptionOpen ? 'opacity-100' : ''
          }`}
        >
          <h3 className="m-0 max-w-full shrink-0 text-[clamp(17px,2.2vw,28px)] leading-[1.15] font-semibold [overflow-wrap:anywhere]">
            {title}
          </h3>

          <p
            className="m-0 max-w-[38rem] whitespace-pre-line text-[clamp(12px,1.15vw,16px)] leading-[1.4] [overflow-wrap:anywhere]"
            id={descriptionId}
          >
            {serviceDescription || 'Service description unavailable.'}
          </p>
        </div>
      </div>
      <h3 className="m-0 min-w-0 text-[clamp(24px,3.7vw,64px)] leading-[1.35] font-semibold text-balance text-[#323232] [overflow-wrap:anywhere] hyphens-auto">{title}</h3>
    </article>
  )
}

export default ServiceCard
