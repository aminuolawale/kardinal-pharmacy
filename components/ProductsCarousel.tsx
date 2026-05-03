'use client'
import { useState } from 'react'
import type { ProductItem } from '@/lib/types'

const PAGE_SIZE = 3
const CARD_CLASSES = ['product-card product-card--a', 'product-card product-card--b', 'product-card product-card--c']

function FlaskIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M11 4h10M10 12L6 24a2 2 0 001.9 2.5h16.2A2 2 0 0026 24L22 12V4H10v8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ProductCard({ item, index }: { item: ProductItem; index: number }) {
  return (
    <div className={`${CARD_CLASSES[index % 3]} reveal${index === 1 ? ' reveal--delay' : index === 2 ? ' reveal--delay-2' : ''}`}>
      {item.imageUrl ? (
        <div style={{ width: '100%', height: 180, overflow: 'hidden', borderRadius: 8, marginBottom: 16 }}>
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : (
        <div className="product-card__icon"><FlaskIcon /></div>
      )}
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      {item.price && (
        <p style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '1.05rem', margin: '10px 0 4px' }}>
          {item.price}
        </p>
      )}
      <a href="#location" className="text-link text-link--light">Enquire &rarr;</a>
    </div>
  )
}

export default function ProductsCarousel({ items }: { items: ProductItem[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const visible = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const navBtn = (disabled: boolean): React.CSSProperties => ({
    background: 'rgba(255,255,255,.12)',
    border: '1.5px solid rgba(255,255,255,.25)',
    color: '#fff',
    borderRadius: '50%',
    width: 40, height: 40,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.35 : 1,
    fontSize: '1rem',
  })

  return (
    <>
      <div className="products-grid">
        {visible.map((item, i) => (
          <ProductCard key={item.id} item={item} index={i} />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 36 }}>
        <button onClick={() => setPage((p) => p - 1)} disabled={page === 0} style={navBtn(page === 0)}>←</button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            style={{
              width: 10, height: 10, borderRadius: '50%', border: 'none', padding: 0,
              background: i === page ? '#fff' : 'rgba(255,255,255,.3)',
              cursor: 'pointer',
            }}
          />
        ))}
        <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1} style={navBtn(page >= totalPages - 1)}>→</button>
      </div>
    </>
  )
}
