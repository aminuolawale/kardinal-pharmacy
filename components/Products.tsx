import { getConfig } from '@/lib/config'
import ProductsCarousel from './ProductsCarousel'

function FlaskIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M11 4h10M10 12L6 24a2 2 0 001.9 2.5h16.2A2 2 0 0026 24L22 12V4H10v8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const CARD_CLASSES = ['product-card product-card--a', 'product-card product-card--b', 'product-card product-card--c']

export default async function Products() {
  const { cosmeticLine } = await getConfig()
  const { headline, subtitle, items } = cosmeticLine

  return (
    <section className="section section--dark" id="products">
      <div className="container">

        <div className="section-header section-header--light reveal">
          <span className="section-label section-label--light">Our Cosmetic Line</span>
          <h2>{headline}</h2>
          <p>{subtitle}</p>
        </div>

        {items.length > 3 ? (
          <ProductsCarousel items={items} />
        ) : (
          <div className="products-grid">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`${CARD_CLASSES[i % 3]} reveal${i === 1 ? ' reveal--delay' : i === 2 ? ' reveal--delay-2' : ''}`}
              >
                <div className="product-card__icon"><FlaskIcon /></div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <a href="#location" className="text-link text-link--light">Enquire &rarr;</a>
              </div>
            ))}
          </div>
        )}

        <div className="products-cta reveal">
          <p>All cosmetic products are available in-store. Custom formulations available on request.</p>
          <a href="#location" className="btn btn--outline-light">Visit Us or Enquire</a>
        </div>

      </div>
    </section>
  )
}
