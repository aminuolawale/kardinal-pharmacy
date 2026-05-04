import { getConfig } from '@/lib/config'
import ServiceCard from './ServiceCard'
import ServicesCarousel from './ServicesCarousel'

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
              <ServiceCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
