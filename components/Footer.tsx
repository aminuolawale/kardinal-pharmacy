export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">

        <div className="footer-brand">
          <a href="#home" className="logo logo--light">
            <svg className="logo__cross" width="26" height="26" viewBox="0 0 30 30" fill="none" aria-hidden="true">
              <rect x="11" y="2" width="8" height="26" rx="3" fill="currentColor" />
              <rect x="2" y="11" width="26" height="8" rx="3" fill="currentColor" />
            </svg>
            <span>Kardinal <strong>Pharmacy</strong></span>
          </a>
          <p>Trusted pharmaceutical care for the Ijegun community and beyond.</p>
          <p>Your health, our commitment.</p>
          <p className="footer-reg">Pharm. Aminu Abdulsalam — PCN Registered</p>
        </div>

        <div className="footer-col">
          <h4>Services</h4>
          <ul role="list">
            <li><a href="#services">Pharmaceutical Consultations</a></li>
            <li><a href="#services">Prescription Services</a></li>
            <li><a href="#products">Cosmetic Products</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Information</h4>
          <ul role="list">
            <li><a href="#about">About the Pharmacist</a></li>
            <li><a href="#location">Find Us</a></li>
            <li><a href="#location">Opening Hours</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <address>
            <p>Ijegun Road, Ijegun,<br />Lagos State, Nigeria</p>
            <p><a href="tel:+2348134567890">+234 813 456 7890</a></p>
            <p><a href="mailto:info@kardinalpharmacy.com">info@kardinalpharmacy.com</a></p>
          </address>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2026 Kardinal Pharmacy. All rights reserved.</p>
          <p>Ijegun, Lagos &mdash; Nigeria</p>
        </div>
      </div>
    </footer>
  )
}
