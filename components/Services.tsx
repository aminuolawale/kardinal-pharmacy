import { getConfig } from '@/lib/config'
import ServicesCarousel from './ServicesCarousel'

function CrossIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="11" y="3" width="6" height="22" rx="2" fill="currentColor" />
      <rect x="3" y="11" width="22" height="6" rx="2" fill="currentColor" />
    </svg>
  )
}

export default async function Services() {
  const { services } = await getConfig()
  const { headline, subtitle, items } = services

  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">What We Offer</span>
          <h2>{headline}</h2>
          <p>{subtitle}</p>
        </div>

        {items.length > 3 ? (
          <ServicesCarousel items={items} />
        ) : (
          <div className="services-grid">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`service-card reveal${i === 1 ? ' reveal--delay' : i === 2 ? ' reveal--delay-2' : ''}`}
              >
                <div className="service-card__icon"><CrossIcon /></div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <a href="#location" className="text-link">Book a session &rarr;</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
