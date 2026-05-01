'use client'
import { useState } from 'react'
import type { ListItem } from '@/lib/types'

const PAGE_SIZE = 3

function CrossIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="11" y="3" width="6" height="22" rx="2" fill="currentColor" />
      <rect x="3" y="11" width="22" height="6" rx="2" fill="currentColor" />
    </svg>
  )
}

export default function ServicesCarousel({ items }: { items: ListItem[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const visible = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div>
      <div className="services-grid">
        {visible.map((item, i) => (
          <div key={item.id} className={`service-card reveal${i === 1 ? ' reveal--delay' : i === 2 ? ' reveal--delay-2' : ''}`}>
            <div className="service-card__icon"><CrossIcon /></div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <a href="#location" className="text-link">Book a session &rarr;</a>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 36 }}>
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            style={{
              background: 'none',
              border: '1.5px solid var(--border)',
              borderRadius: '50%',
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              opacity: page === 0 ? 0.35 : 1,
              fontSize: '1rem',
            }}
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              style={{
                width: 10, height: 10,
                borderRadius: '50%',
                border: 'none',
                background: i === page ? 'var(--green-800)' : 'var(--border)',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            style={{
              background: 'none',
              border: '1.5px solid var(--border)',
              borderRadius: '50%',
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              opacity: page >= totalPages - 1 ? 0.35 : 1,
              fontSize: '1rem',
            }}
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
