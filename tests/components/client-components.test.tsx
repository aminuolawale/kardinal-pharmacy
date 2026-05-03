import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Nav from '@/components/Nav'
import ProductsCarousel from '@/components/ProductsCarousel'
import ServicesCarousel from '@/components/ServicesCarousel'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const services = Array.from({ length: 4 }, (_, index) => ({
  id: `s${index}`,
  title: `Service ${index + 1}`,
  description: `Service ${index + 1} details`,
}))

const products = Array.from({ length: 4 }, (_, index) => ({
  id: `p${index}`,
  title: `Product ${index + 1}`,
  description: `Product ${index + 1} details`,
  price: index === 0 ? '1000' : '',
  imageUrl: '',
}))

beforeEach(() => {
  pushMock.mockReset()
  document.body.style.overflow = ''
})

describe('client navigation', () => {
  it('opens and closes the mobile menu while managing body overflow', async () => {
    const user = userEvent.setup()
    render(<Nav />)

    const button = screen.getByRole('button', { name: 'Open menu' })
    await user.click(button)

    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
    expect(document.body.style.overflow).toBe('hidden')

    await user.click(screen.getAllByRole('link', { name: 'Services' })[1])

    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
    expect(document.body.style.overflow).toBe('')
  })

  it('routes to the admin login after four spacer clicks', () => {
    const { container } = render(<Nav />)
    const spacer = container.querySelector('.nav__spacer')
    expect(spacer).not.toBeNull()

    fireEvent.click(spacer!)
    fireEvent.click(spacer!)
    fireEvent.click(spacer!)
    expect(pushMock).not.toHaveBeenCalled()

    fireEvent.click(spacer!)
    expect(pushMock).toHaveBeenCalledWith('/admin/login')
  })
})

describe('carousels', () => {
  it('paginates service cards three at a time', async () => {
    const user = userEvent.setup()
    render(<ServicesCarousel items={services} />)

    expect(screen.getByText('Service 1')).toBeInTheDocument()
    expect(screen.queryByText('Service 4')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '→' }))

    expect(screen.queryByText('Service 1')).not.toBeInTheDocument()
    expect(screen.getByText('Service 4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '→' })).toBeDisabled()
  })

  it('paginates product cards and disables previous on the first page', async () => {
    const user = userEvent.setup()
    render(<ProductsCarousel items={products} />)

    expect(screen.getByRole('button', { name: '←' })).toBeDisabled()
    expect(screen.getByText('Product 1')).toBeInTheDocument()
    expect(screen.queryByText('Product 4')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '→' }))

    expect(screen.getByText('Product 4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '→' })).toBeDisabled()
  })
})
