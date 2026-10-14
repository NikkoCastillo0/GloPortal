import { useId } from 'react'
import './ServiceCard.css'

function ServiceCard({ title, image, description }) {
  const descriptionId = useId()
  const serviceDescription = description?.trim()

  return (
    <article className="service-card" tabIndex={0} aria-describedby={descriptionId}>
      <div className="service-card__media">
        {image ? (
          <img className="service-card__image" src={image} alt="" />
        ) : (
          <div className="service-card__image-placeholder">
            Service image unavailable
          </div>
        )}
        <div className="service-card__overlay">
          <p id={descriptionId}>
            {serviceDescription || 'Service description unavailable.'}
          </p>
        </div>
      </div>
      <h3 className="service-card__title">{title}</h3>
    </article>
  )
}

export default ServiceCard