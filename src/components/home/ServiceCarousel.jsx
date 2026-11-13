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
  const [activeIndex, setActiveIndex] = useState(0)
  const [canScrollPrevious, setCanScrollPrevious] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return undefined

    const updateNavigation = () => {
      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth
      setCanScrollPrevious(carousel.scrollLeft > 1)
      setCanScrollNext(maxScrollLeft - carousel.scrollLeft > 1)

      const cards = Array.from(
        carousel.querySelectorAll('[data-service-card]'),
      )

      if (!cards.length) return

      const carouselRect = carousel.getBoundingClientRect()
      const viewportLeft = carouselRect.left + carousel.clientLeft
      const viewportRight = viewportLeft + carousel.clientWidth

      let mostVisibleIndex = 0
      let greatestVisibleRatio = -1

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect()
        const visibleWidth = Math.max(
          0,
          Math.min(cardRect.right, viewportRight) -
            Math.max(cardRect.left, viewportLeft),
        )
        const visibleRatio = visibleWidth / cardRect.width

        // If two cards are equally visible, choose the later one.
        if (visibleRatio >= greatestVisibleRatio) {
          greatestVisibleRatio = visibleRatio
          mostVisibleIndex = index
        }
      })

      setActiveIndex(mostVisibleIndex)
    }

    updateNavigation()
    carousel.addEventListener('scroll', updateNavigation, { passive: true })
    window.addEventListener('resize', updateNavigation)

    return () => {
      carousel.removeEventListener('scroll', updateNavigation)
      window.removeEventListener('resize', updateNavigation)
    }
  }, [services.length])

  const scrollCarousel = (index) => {
    const carousel = carouselRef.current
    if (!carousel) return

    const cards = carousel.querySelectorAll('[data-service-card]')
    const card = cards[index]
    if (!card) return

    const cardRect = card.getBoundingClientRect()

    const carouselLeft =
      carousel.getBoundingClientRect().left + carousel.clientLeft

    const targetScroll =
      index === cards.length - 1
        ? carousel.scrollLeft +
          cardRect.left +
          cardRect.width / 2 -
          (carouselLeft + carousel.clientWidth / 2)
        : carousel.scrollLeft + cardRect.left - carouselLeft

    const maxScroll = carousel.scrollWidth - carousel.clientWidth
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    setActiveIndex(index)

    carousel.scrollTo({
      left: Math.max(0, Math.min(targetScroll, maxScroll)),
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }

  const handleKeyDown = (event) => {
    if(event.key==='ArrowLeft' && activeIndex>0){
      event.preventDefault()
      scrollCarousel(activeIndex-1)
    }
    if(event.key==='ArrowRight' && activeIndex<services.length-1){
      event.preventDefault()
      scrollCarousel(activeIndex+1)
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
      </div>
      <div
        className="box-border w-full snap-x snap-mandatory overflow-x-auto scroll-smooth px-[clamp(16px,8.9vw,154px)] py-2 [overscroll-behavior-inline:contain] [scroll-padding-inline:clamp(16px,8.9vw,154px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:[outline:3px_solid_#323232] focus-visible:outline-offset-[-3px] motion-reduce:scroll-auto"
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
              data-service-card
              key={`${service.title}-${index}`}
            >
              <ServiceCard
                title={service.title}
                image={service.image}
                description={service.description}
              />
            </div>
          ))}

          <div
            aria-hidden="true"
            className="shrink-0 [flex:0_0_max(0px,calc((100vw-min(52vw,894px))/5))] [@media(max-width:600px)]:basis-0"
          />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          className="grid size-[clamp(2.25rem,5vw,2.75rem)] shrink-0 cursor-pointer place-items-center rounded-full border border-solid border-[#767676] bg-white text-[#323232] text-[clamp(1.125rem,2.5vw,1.5rem)] leading-none transition-colors duration-150 [@media(hover:hover)]:hover:bg-[#323232] [@media(hover:hover)]:hover:text-white active:bg-[#323232] active:text-white focus-visible:outline-2 disabled:cursor-default disabled:opacity-40"          type="button"
          aria-label="Scroll to previous service"
          onClick={() => scrollCarousel(Math.max(0, activeIndex-1))}
          disabled={!canScrollPrevious}
        >
          <span aria-hidden="true">&larr;</span>
        </button>

        <div className="flex items-center justify-center gap-2">
          {services.map((service, index) => (
            <button
              className={`size-2.5 cursor-pointer rounded-full transition-colors ${
                index === activeIndex
                  ? 'bg-[#323232]'
                  : 'bg-[#b8b8b8] hover:bg-[#767676]'
              }`}
              type="button"
              key={`dot-${service.title}-${index}`}
              aria-label={`Scroll to ${service.title}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => scrollCarousel(index)}
            />
          ))}
        </div>
        <button
          className="grid size-[clamp(2.25rem,5vw,2.75rem)] shrink-0 cursor-pointer place-items-center rounded-full border border-solid border-[#767676] bg-white text-[#323232] text-[clamp(1.125rem,2.5vw,1.5rem)] leading-none transition-colors duration-150 [@media(hover:hover)]:hover:bg-[#323232] [@media(hover:hover)]:hover:text-white active:bg-[#323232] active:text-white focus-visible:outline-2 disabled:cursor-default disabled:opacity-40"
          type="button"
          aria-label="Scroll to next service"
          onClick={() =>
            scrollCarousel(Math.min(services.length - 1, activeIndex + 1))
          }
          disabled={!canScrollNext}
        >
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </section>
  )
}

export default ServiceCarousel
