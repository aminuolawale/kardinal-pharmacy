import { getConfig } from '@/lib/config'

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="8" fill="#d1e7dd" />
      <path d="M5 9l3 3 5-5" stroke="#0A5C36" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default async function About() {
  const { pharmacist } = await getConfig()

  const initials = pharmacist.name
    .split(' ')
    .filter((w) => !w.endsWith('.'))
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

  const paragraphs = pharmacist.profileDescription.split('\n\n').filter(Boolean)

  return (
    <section className="section section--alt" id="about">
      <div className="container about-inner">

        <div className="about-visual reveal">
          <div className="about-photo"><span>{initials}</span></div>
          <ul className="credentials" role="list">
            {pharmacist.credentials.map((c) => (
              <li key={c}><CheckIcon /> {c}</li>
            ))}
          </ul>
        </div>

        <div className="about-content reveal reveal--delay">
          <span className="section-label">Meet Your Pharmacist</span>
          <h2>{pharmacist.name}</h2>
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <a href="#location" className="btn btn--primary">Schedule a Consultation</a>
        </div>

      </div>
    </section>
  )
}
