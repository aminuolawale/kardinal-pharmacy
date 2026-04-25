export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="container hero__inner">

        <div className="hero__content reveal">
          <span className="pill pill--light">Ijegun, Lagos</span>
          <h1 className="hero__title">
            Your Health,<br /><em>Our Commitment.</em>
          </h1>
          <p className="hero__sub">
            Expert pharmaceutical consultations, prescription dispensing, and bespoke cosmetic
            products — from a trusted, registered pharmacist in the heart of Lagos.
          </p>
          <div className="hero__actions">
            <a href="#location" className="btn btn--primary btn--lg">Book a Consultation</a>
            <a href="#services" className="btn btn--ghost btn--lg">Our Services</a>
          </div>
        </div>

        <div className="hero__card reveal reveal--delay">
          <div className="hero__avatar"><span>AA</span></div>
          <p className="hero__card-name">Pharm. Aminu Abdulsalam</p>
          <p className="hero__card-role">Registered Pharmacist &amp; Cosmetic Formulator</p>
          <div className="hero__badges">
            <span className="badge">PCN Licensed</span>
            <span className="badge">NAFDAC Reg.</span>
            <span className="badge">10+ Yrs Exp.</span>
          </div>
        </div>

      </div>

      <div className="hero__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 0 C360 60 1080 60 1440 0 L1440 60 L0 60 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  )
}
