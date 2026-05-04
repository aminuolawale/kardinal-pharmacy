'use client'
import { useState } from 'react'
import type { ProductItem } from '@/lib/types'
import ProductCard from './ProductCard'

const PAGE_SIZE = 3

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
