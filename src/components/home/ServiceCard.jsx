import { useId } from 'react'

function ServiceCard({ title, image, description }) {
  const descriptionId = useId()
  const serviceDescription = description?.trim()

  return (
    <article className="group box-border flex h-full min-w-0 flex-col gap-3 p-1.5 text-center text-[#323232] [outline:none] focus-visible:rounded-[0.75rem] focus-visible:[outline:3px_solid_#323232] focus-visible:outline-offset-[3px]" tabIndex={0} aria-describedby={descriptionId}>
      <div className="relative aspect-[894/414] w-full flex-none overflow-hidden rounded-[5px] border-2 border-solid border-[#323232] [background:var(--code-bg,#f4f3ec)] [box-shadow:4px_4px_6px_rgb(0_0_0_/_20%)]">
        {image ? (
          <img className="block h-full w-full object-cover" src={image} alt="" />
        ) : (
          <div className="box-border grid h-full w-full place-items-center p-4 text-center text-[0.875rem] text-[#323232]">
            Service image unavailable
          </div>
        )}
        <div className="absolute inset-0 box-border grid place-items-center bg-[rgb(8_6_13_/_92%)] p-[clamp(0.75rem,3vw,1.25rem)] text-center text-white opacity-0 transition-opacity duration-[180ms] ease-[ease] group-[:hover]:opacity-100 group-focus:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
          <p className="m-0 max-h-full max-w-full overflow-y-auto text-[clamp(0.875rem,1.15vw,1rem)] leading-[1.5] [overflow-wrap:anywhere]" id={descriptionId}>
            {serviceDescription || 'Service description unavailable.'}
          </p>
        </div>
      </div>
      <h3 className="m-0 min-w-0 text-[clamp(24px,3.7vw,64px)] leading-[1.35] font-semibold text-balance text-[#323232] [overflow-wrap:anywhere] hyphens-auto">{title}</h3>
    </article>
  )
}

export default ServiceCard
