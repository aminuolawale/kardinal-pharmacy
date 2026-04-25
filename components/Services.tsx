export default function Services() {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">What We Offer</span>
          <h2>Comprehensive Care<br />Under One Roof</h2>
          <p>From your first health question to your last prescription, we are with you every step of the way.</p>
        </div>

        <div className="services-grid">

          <div className="service-card reveal">
            <div className="service-card__icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <circle cx="14" cy="9" r="5" stroke="currentColor" strokeWidth="2" />
                <path d="M4 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M19 15l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>Pharmaceutical Consultations</h3>
            <p>Receive personalised, evidence-based guidance on medications, dosage, drug interactions, and health management from a licensed pharmacist.</p>
            <a href="#location" className="text-link">Book a session &rarr;</a>
          </div>

          <div className="service-card reveal reveal--delay">
            <div className="service-card__icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect x="4" y="3" width="20" height="22" rx="3" stroke="currentColor" strokeWidth="2" />
                <path d="M9 9h6M9 13h10M9 17h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 9a3 3 0 010 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M16 14l3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Prescription Services</h3>
            <p>Accurate, efficient dispensing of your prescriptions paired with thorough medication counseling so you understand your treatment and achieve the best outcomes.</p>
            <a href="#location" className="text-link">Learn more &rarr;</a>
          </div>

          <div className="service-card reveal reveal--delay-2">
            <div className="service-card__icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M11 4h6M10 11L5 23a2 2 0 001.9 2.5h14.2A2 2 0 0023 23L18 11V4H10v7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 19h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="17" cy="15" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <h3>Cosmetic Manufacturing</h3>
            <p>Bespoke personal care and cosmetic products manufactured in-house using pharmaceutical-grade ingredients, formulated for safety, quality, and the Nigerian climate.</p>
            <a href="#products" className="text-link">View products &rarr;</a>
          </div>

        </div>
      </div>
    </section>
  )
}
