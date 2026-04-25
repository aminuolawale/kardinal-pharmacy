const items = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Licensed & Certified',
    body: 'Fully registered with the Pharmacists Council of Nigeria (PCN) and compliant with all NAFDAC regulations.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Patient-Centred Care',
    body: 'Every consultation is personal. We take time to understand your specific needs and never rush your care.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.045-.128-2.06-.382-3.016z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'In-House Manufacturing',
    body: 'Our cosmetics are manufactured under strict pharmaceutical conditions, ensuring purity, potency, and safety.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Community Rooted',
    body: 'Born in Ijegun, built for Lagos. We understand local health challenges and are committed to accessible care.',
  },
]

export default function Trust() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">Why Kardinal</span>
          <h2>Pharmacy Care You Can Trust</h2>
        </div>
        <div className="trust-grid">
          {items.map((item, i) => (
            <div key={item.title} className={`trust-item reveal${i % 2 === 1 ? ' reveal--delay' : ''}`}>
              <div className="trust-item__icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
