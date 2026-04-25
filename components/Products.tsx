export default function Products() {
  return (
    <section className="section section--dark" id="products">
      <div className="container">

        <div className="section-header section-header--light reveal">
          <span className="section-label section-label--light">Our Cosmetic Line</span>
          <h2>Pharmaceutical-Grade Cosmetics,<br />Made in Lagos</h2>
          <p>Every product is formulated by Pharm. Aminu using rigorously tested, pharmaceutical-quality ingredients — designed specifically for Nigerian skin and climatic conditions.</p>
        </div>

        <div className="products-grid">

          <div className="product-card product-card--a reveal">
            <div className="product-card__icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="13" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M9 24c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Skincare Range</h3>
            <p>Gentle, effective formulations for cleansing, moisturising, and protecting your skin — free from harmful bleaching agents and harsh chemicals.</p>
            <a href="#location" className="text-link text-link--light">Enquire &rarr;</a>
          </div>

          <div className="product-card product-card--b reveal reveal--delay">
            <div className="product-card__icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M10 6h12v4a8 8 0 01-12 0V6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 10v16M10 26h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Body Care</h3>
            <p>Rich body creams, lotions, and oils crafted to deeply nourish and protect your skin through Lagos&apos;s heat and humidity.</p>
            <a href="#location" className="text-link text-link--light">Enquire &rarr;</a>
          </div>

          <div className="product-card product-card--c reveal reveal--delay-2">
            <div className="product-card__icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M16 4c-4 0-8 6-8 12s3 10 8 10 8-4 8-10S20 4 16 4z" stroke="currentColor" strokeWidth="2" />
                <path d="M16 4v22M10 12c2-1 4-1.5 6-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Hair &amp; Scalp</h3>
            <p>Specialised formulations to promote scalp health, strengthen hair, and address common concerns like dryness, breakage, and dandruff.</p>
            <a href="#location" className="text-link text-link--light">Enquire &rarr;</a>
          </div>

        </div>

        <div className="products-cta reveal">
          <p>All cosmetic products are available in-store. Custom formulations available on request.</p>
          <a href="#location" className="btn btn--outline-light">Visit Us or Enquire</a>
        </div>

      </div>
    </section>
  )
}
