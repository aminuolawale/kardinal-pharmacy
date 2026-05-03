import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import About from '@/components/About'
import Hero from '@/components/Hero'
import Products, { ProductCard } from '@/components/Products'
import Services from '@/components/Services'
import Trust from '@/components/Trust'
import type { SiteConfig } from '@/lib/types'

const { getConfigMock } = vi.hoisted(() => ({
  getConfigMock: vi.fn(),
}))

vi.mock('@/lib/config', () => ({
  getConfig: getConfigMock,
}))

const config: SiteConfig = {
  siteTitle: 'Kardinal Pharmacy',
  hero: {
    headlinePrimary: 'Primary headline',
    headlineEmphasis: 'Emphasis headline',
    subtitle: 'Helpful healthcare subtitle',
  },
  pharmacist: {
    name: 'Pharm. Test Person',
    description: 'Registered Pharmacist',
    credentials: ['PCN Licensed', 'NAFDAC Reg.'],
    profileDescription: 'First paragraph.\n\nSecond paragraph.',
    avatarUrl: '/avatar.jpg',
  },
  services: {
    headline: 'Service headline',
    subtitle: 'Service subtitle',
    items: [
      { id: 's1', title: 'Consultations', description: 'Consultation details' },
      { id: 's2', title: 'Prescriptions', description: 'Prescription details' },
      { id: 's3', title: 'Cosmetics', description: 'Cosmetic details' },
    ],
  },
  trust: {
    items: [
      { id: 't1', title: 'Licensed', description: 'Licensed details' },
      { id: 't2', title: 'Community Rooted', description: 'Community details' },
    ],
  },
  cosmeticLine: {
    headline: 'Cosmetic headline',
    subtitle: 'Cosmetic subtitle',
    items: [
      {
        id: 'p1',
        title: 'Skin Toner',
        description: 'Skin toner details',
        price: '5000',
        imageUrl: '/toner.jpg',
      },
      {
        id: 'p2',
        title: 'Body Cream',
        description: 'Body cream details',
        price: '',
        imageUrl: '',
      },
    ],
  },
}

beforeEach(() => {
  getConfigMock.mockResolvedValue(config)
})

describe('site server components', () => {
  it('renders hero content from site configuration', async () => {
    render(await Hero())

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Primary headlineEmphasis headline',
    )
    expect(screen.getByText('Helpful healthcare subtitle')).toBeInTheDocument()
    expect(screen.getByAltText('Pharm. Test Person')).toHaveAttribute('src', '/avatar.jpg')
    expect(screen.getByText('PCN Licensed')).toBeInTheDocument()
  })

  it('renders pharmacist profile paragraphs and credentials', async () => {
    render(await About())

    expect(screen.getByRole('heading', { name: 'Pharm. Test Person' })).toBeInTheDocument()
    expect(screen.getByText('First paragraph.')).toBeInTheDocument()
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument()
    expect(screen.getByText(/NAFDAC Reg./)).toBeInTheDocument()
  })

  it('renders service cards from configured services', async () => {
    render(await Services())

    expect(screen.getByRole('heading', { name: 'Service headline' })).toBeInTheDocument()
    expect(screen.getByText('Consultation details')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Book a session/i })).toHaveLength(3)
  })

  it('renders trust items from configured trust content', async () => {
    render(await Trust())

    expect(screen.getByRole('heading', { name: 'Pharmacy Care You Can Trust' })).toBeInTheDocument()
    expect(screen.getByText('Licensed details')).toBeInTheDocument()
    expect(screen.getByText('Community details')).toBeInTheDocument()
  })

  it('renders product cards, image alt text, and prices from configured products', async () => {
    render(await Products())

    expect(screen.getByRole('heading', { name: 'Cosmetic headline' })).toBeInTheDocument()
    expect(screen.getByAltText('Skin Toner')).toHaveAttribute('src', '/toner.jpg')
    expect(screen.getByText('₦5000')).toBeInTheDocument()
    expect(screen.getAllByText(/^₦/)).toHaveLength(1)
  })

  it('falls back to an icon-only product card when no product image exists', () => {
    render(
      <ProductCard
        index={0}
        item={{ id: 'p', title: 'No Image Product', description: 'Details', price: '', imageUrl: '' }}
      />,
    )

    expect(screen.getByRole('heading', { name: 'No Image Product' })).toBeInTheDocument()
    expect(screen.queryByAltText('No Image Product')).not.toBeInTheDocument()
  })
})
