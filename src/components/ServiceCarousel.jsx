import { useEffect, useId, useRef, useState } from 'react'
import ServiceCard from './ServiceCard.jsx'
import tireMountAndBalanceImage from '../assets/services/tire-mount-and-balance.png'
import tirePlugPatchImage from '../assets/services/tire-plug-patch.png'
import wheelBalancingImage from '../assets/services/wheel-balancing.jpg'
import tpmsServiceImage from '../assets/services/tpms-service.jpg'
import './ServiceCarousel.css'

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
    <section className="service-carousel" aria-labelledby={headingId}>
      <div className="service-carousel__header">
        <h2 className="service-carousel__heading" id={headingId}>
          {title}
        </h2>
        <div className="service-carousel__controls">
          <button
            className="service-carousel__button"
            type="button"
            aria-label="Previous services"
            onClick={() => scrollCarousel(-1)}
            disabled={!canScrollPrevious}
          >
            <span aria-hidden="true">&larr;</span>
          </button>
          <button
            className="service-carousel__button"
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
        className="service-carousel__viewport"
        ref={carouselRef}
        role="region"
        aria-label={`${title} carousel`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div className="service-carousel__track">
          {services.map((service, index) => (
            <div
              className="service-carousel__item"
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
