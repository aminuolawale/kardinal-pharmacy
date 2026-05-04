import { getConfig } from '@/lib/config'
import ProductCard from './ProductCard'
import ProductsCarousel from './ProductsCarousel'

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
              <ProductCard key={item.id} item={item} index={i} />
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
