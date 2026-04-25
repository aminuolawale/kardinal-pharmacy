export default function Location() {
  return (
    <section className="section" id="location">
      <div className="container">

        <div className="section-header reveal">
          <span className="section-label">Find Us</span>
          <h2>Visit Kardinal Pharmacy</h2>
          <p>We are conveniently located in Ijegun, Lagos and welcome walk-ins as well as scheduled consultations.</p>
        </div>

        <div className="location-grid">

          <div className="info-card reveal">
            <div className="info-card__icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <path d="M11 2C7.13 2 4 5.13 4 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" />
                <circle cx="11" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h3>Address</h3>
            <p>Ijegun Road, Ijegun,<br />Alimosho LGA,<br />Lagos State, Nigeria</p>
          </div>

          <div className="info-card reveal reveal--delay">
            <div className="info-card__icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M11 6v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Opening Hours</h3>
            <p>Mon – Fri: 8:00am – 8:00pm<br />Saturday: 9:00am – 6:00pm<br />Sunday: 10:00am – 3:00pm</p>
          </div>

          <div className="info-card reveal reveal--delay-2">
            <div className="info-card__icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <path d="M20.01 15.38c-.04-.34-.29-.65-.62-.8l-4.07-1.83a.99.99 0 00-1.07.21l-1.6 1.6c-.08.04-.34.01-.4-.03a17.44 17.44 0 01-4.67-4.67c-.04-.06-.07-.31-.03-.4l1.6-1.6a1 1 0 00.21-1.07L7.53 2.72a.95.95 0 00-.81-.62C6.47 2.06 6.2 2 5.91 2A3.91 3.91 0 002 5.91c0 9.41 7.68 17.09 17.09 17.09A3.91 3.91 0 0023 19.09c0-.29-.06-.56-.09-.8l-.9.07z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>Contact</h3>
            <p>
              <a href="tel:+2348134567890">+234 813 456 7890</a>
              <br />
              <a href="mailto:info@kardinalpharmacy.com">info@kardinalpharmacy.com</a>
            </p>
          </div>

        </div>

        <div className="map-placeholder reveal">
          <div className="map-placeholder__inner">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26C38 10.27 31.73 4 24 4z" stroke="#0A5C36" strokeWidth="2.5" />
              <circle cx="24" cy="18" r="5" stroke="#0A5C36" strokeWidth="2.5" />
            </svg>
            <p><strong>Ijegun, Lagos — Nigeria</strong></p>
            <p>Alimosho Local Government Area</p>
            <a
              href="https://maps.google.com/?q=Ijegun,Lagos,Nigeria"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
            >
              Open in Google Maps
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
