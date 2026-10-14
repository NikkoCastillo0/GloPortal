import { useEffect, useId, useRef, useState } from 'react'
import ServiceCard from './ServiceCard.jsx'
import './ServiceCarousel.css'

const defaultServices = [
  { title: 'Wheel Painting', image: '', description: '' },
  { title: 'Tire Mount and Balance', image: '', description: '' },
  { title: 'Tire Plug/Patch', image: '', description: '' },
  { title: 'TPMS Service', image: '', description: '' },
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
