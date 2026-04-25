function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="8" fill="#d1e7dd" />
      <path d="M5 9l3 3 5-5" stroke="#0A5C36" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function About() {
  return (
    <section className="section section--alt" id="about">
      <div className="container about-inner">

        <div className="about-visual reveal">
          <div className="about-photo"><span>AA</span></div>
          <ul className="credentials" role="list">
            <li><CheckIcon /> B.Pharm — University of Lagos</li>
            <li><CheckIcon /> PCN Registered Pharmacist</li>
            <li><CheckIcon /> Certified Cosmetic Formulator</li>
            <li><CheckIcon /> 10+ Years Clinical Experience</li>
          </ul>
        </div>

        <div className="about-content reveal reveal--delay">
          <span className="section-label">Meet Your Pharmacist</span>
          <h2>Pharm. Aminu<br />Abdulsalam</h2>
          <p>
            Pharm. Aminu Abdulsalam is a registered pharmacist with extensive expertise in
            pharmaceutical care, patient counseling, and cosmetic formulation. As the founder of
            Kardinal Pharmacy, he has spent over a decade providing affordable, high-quality
            healthcare to the Ijegun community.
          </p>
          <p>
            His practice is grounded in the belief that every patient deserves undivided attention.
            He takes the time to understand each individual&apos;s health history, lifestyle, and
            needs — then crafts solutions that genuinely make a difference, not just fill a
            prescription.
          </p>
          <p>
            Beyond clinical pharmacy, Pharm. Aminu is a passionate cosmetic chemist, developing
            a growing line of personal care products formulated specifically for Nigerian skin and
            tropical conditions — combining scientific rigour with the warmth of local knowledge.
          </p>
          <a href="#location" className="btn btn--primary">Schedule a Consultation</a>
        </div>

      </div>
    </section>
  )
}
