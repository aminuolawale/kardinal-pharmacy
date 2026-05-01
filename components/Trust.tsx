import { getConfig } from '@/lib/config'

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l8 3v7c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V5l8-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default async function Trust() {
  const { trust } = await getConfig()

  return (
    <section className="section">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">Why Kardinal</span>
          <h2>Pharmacy Care You Can Trust</h2>
        </div>
        <div className="trust-grid">
          {trust.items.map((item, i) => (
            <div key={item.id} className={`trust-item reveal${i % 2 === 1 ? ' reveal--delay' : ''}`}>
              <div className="trust-item__icon"><ShieldIcon /></div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
