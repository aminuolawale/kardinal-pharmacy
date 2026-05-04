'use client'
import { useState } from 'react'
import type { ListItem } from '@/lib/types'
import ServiceCard from './ServiceCard'

const PAGE_SIZE = 3

export default function ServicesCarousel({ items }: { items: ListItem[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const visible = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div>
      <div className="services-grid">
        {visible.map((item, i) => (
          <ServiceCard key={item.id} item={item} index={i} />
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
