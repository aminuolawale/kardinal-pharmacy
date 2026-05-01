import { getConfig } from '@/lib/config'

export default async function Hero() {
  const { hero, pharmacist } = await getConfig()

  const initials = pharmacist.name
    .split(' ')
    .filter((w) => !w.endsWith('.'))
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

  return (
    <section className="hero" id="home">
      <div className="container hero__inner">

        <div className="hero__content reveal">
          <span className="pill pill--light">Ijegun, Lagos</span>
          <h1 className="hero__title">
            {hero.headlinePrimary}<br /><em>{hero.headlineEmphasis}</em>
          </h1>
          <p className="hero__sub">{hero.subtitle}</p>
          <div className="hero__actions">
            <a href="#location" className="btn btn--primary btn--lg">Book a Consultation</a>
            <a href="#services" className="btn btn--ghost btn--lg">Our Services</a>
          </div>
        </div>

        <div className="hero__card reveal reveal--delay">
          <div className="hero__avatar" style={pharmacist.avatarUrl ? { overflow: 'hidden', padding: 0 } : {}}>
            {pharmacist.avatarUrl
              ? <img src={pharmacist.avatarUrl} alt={pharmacist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span>{initials}</span>
            }
          </div>
          <p className="hero__card-name">{pharmacist.name}</p>
          <p className="hero__card-role">{pharmacist.description}</p>
          <div className="hero__badges">
            {pharmacist.credentials.map((c) => (
              <span key={c} className="badge">{c}</span>
            ))}
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
