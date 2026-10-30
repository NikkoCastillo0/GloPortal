import { useEffect, useId, useRef, useState } from 'react'
import ServiceCard from './ServiceCard.jsx'
import tireMountAndBalanceImage from '../../assets/services/tire-mount-photo.png'
import tirePlugPatchImage from '../../assets/services/tire-patch-photo.png'
import wheelBalancingImage from '../../assets/services/wheel-balancing-photo.png'
import tpmsServiceImage from '../../assets/services/tpms-photo.png'

const defaultServices = [
  {
    title: 'Tire Mount and Balance',
    image: tireMountAndBalanceImage,
    description:
      'Tire mounting and balancing help ensure proper tire installation and a smoother ride.',
  },
  {
    title: 'Tire Plug/Patch',
    image: tirePlugPatchImage,
    description:
      'Tire puncture repairs may help restore a tire when the damage is safely repairable.',
  },
  {
    title: 'Wheel Balancing',
    image: wheelBalancingImage,
    description:
      'Experiencing vibrations while driving? A wheel balancing could help. We correct uneven weight distribution between the tire and wheel for a smoother ride and more even tire wear.',
  },
  {
    title: 'TPMS Service',
    image: tpmsServiceImage,
    description:
      'Tire Pressure Monitoring System service helps identify and address tire pressure sensor issues.',
  },
]

function ServiceCarousel({ services = defaultServices, title = 'Our Services' }) {
  const headingId = useId()
  const carouselRef = useRef(null)
  const [canScrollPrevious, setCanScrollPrevious] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return undefined

    const updateNavigation = () => {
      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth
      setCanScrollPrevious(carousel.scrollLeft > 1)
      setCanScrollNext(maxScrollLeft - carousel.scrollLeft > 1)
    }

    updateNavigation()
    carousel.addEventListener('scroll', updateNavigation, { passive: true })
    window.addEventListener('resize', updateNavigation)

    return () => {
      carousel.removeEventListener('scroll', updateNavigation)
      window.removeEventListener('resize', updateNavigation)
    }
  }, [services.length])

  const scrollCarousel = (direction) => {
    const carousel = carouselRef.current
    if (!carousel) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    carousel.scrollBy({
      left: direction * carousel.clientWidth,
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      scrollCarousel(event.key === 'ArrowLeft' ? -1 : 1)
    }
  }

  return (
    <section
      id="services"
      className="box-border w-full min-w-0 bg-white px-0 py-[clamp(32px,4.6vw,80px)] text-[#323232] [box-shadow:0_4px_4px_rgb(0_0_0_/_15%)]"
      aria-labelledby={headingId}
    >
      <div className="mx-auto mt-0 mb-6 grid max-w-[1500px] gap-4 px-6 py-0 [@media(max-width:600px)]:mb-3 [@media(max-width:600px)]:gap-3 [@media(max-width:600px)]:px-4">
        <h2 className="m-0 text-center text-[clamp(32px,3.7vw,64px)] leading-[1.2] font-semibold text-[#323232]" id={headingId}>
          {title}
        </h2>
        <div className="flex justify-end gap-[10px]">
          <button
            className="grid size-11 cursor-pointer place-items-center rounded-[50%] border border-solid border-[#767676] bg-white text-[#323232] [font-family:inherit] [font-weight:inherit] [font-style:inherit] [font-variant:inherit] [font-stretch:inherit] [font-size:24px] [line-height:1] [&:hover:not(:disabled)]:bg-[#323232] [&:hover:not(:disabled)]:text-white focus-visible:[outline:3px_solid_#323232] focus-visible:outline-offset-[-3px] disabled:cursor-default disabled:opacity-40"
            type="button"
            aria-label="Previous services"
            onClick={() => scrollCarousel(-1)}
            disabled={!canScrollPrevious}
          >
            <span aria-hidden="true">&larr;</span>
          </button>
          <button
            className="grid size-11 cursor-pointer place-items-center rounded-[50%] border border-solid border-[#767676] bg-white text-[#323232] [font-family:inherit] [font-weight:inherit] [font-style:inherit] [font-variant:inherit] [font-stretch:inherit] [font-size:24px] [line-height:1] [&:hover:not(:disabled)]:bg-[#323232] [&:hover:not(:disabled)]:text-white focus-visible:[outline:3px_solid_#323232] focus-visible:outline-offset-[-3px] disabled:cursor-default disabled:opacity-40"
            type="button"
            aria-label="Next services"
            onClick={() => scrollCarousel(1)}
            disabled={!canScrollNext}
          >
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
      <div
        className="box-border w-full snap-x snap-mandatory overflow-x-auto scroll-smooth px-[clamp(16px,8.9vw,154px)] py-2 [overscroll-behavior-inline:contain] [scroll-padding-inline:clamp(16px,8.9vw,154px)] [scrollbar-color:#767676_#fff] [scrollbar-width:thin] focus-visible:[outline:3px_solid_#323232] focus-visible:outline-offset-[-3px] motion-reduce:scroll-auto"
        ref={carouselRef}
        role="region"
        aria-label={`${title} carousel`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-stretch gap-[clamp(24px,8.9vw,154px)]">
          {services.map((service, index) => (
            <div
              className="min-w-0 snap-start [flex:0_0_min(52vw,894px)] [@media(max-width:600px)]:basis-full"
              key={`${service.title}-${index}`}
            >
              <ServiceCard
                title={service.title}
                image={service.image}
                description={service.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServiceCarousel
