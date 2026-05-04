import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminForms from '@/app/admin/AdminForms'
import type { SiteAuditLog, SiteConfig } from '@/lib/types'

vi.mock('@/app/admin/actions', () => ({
  saveSiteTitle: vi.fn(),
  saveHero: vi.fn(),
  savePharmacist: vi.fn(),
  saveServices: vi.fn(),
  saveTrust: vi.fn(),
  saveCosmeticLine: vi.fn(),
  uploadAvatar: vi.fn(),
  uploadProductImage: vi.fn(),
}))

function config(siteTitle: string): SiteConfig {
  return {
    siteTitle,
    hero: {
      headlinePrimary: `${siteTitle} primary`,
      headlineEmphasis: `${siteTitle} emphasis`,
      subtitle: `${siteTitle} subtitle`,
    },
    pharmacist: {
      name: 'Pharm. Test Person',
      description: 'Registered Pharmacist',
      credentials: ['PCN Licensed'],
      profileDescription: `${siteTitle} profile`,
      avatarUrl: '',
    },
    services: {
      headline: `${siteTitle} services`,
      subtitle: `${siteTitle} service subtitle`,
      items: [{ id: 's1', title: `${siteTitle} consults`, description: 'Consultation details' }],
    },
    trust: {
      items: [{ id: 't1', title: `${siteTitle} trust`, description: 'Trust details' }],
    },
    cosmeticLine: {
      headline: `${siteTitle} cosmetics`,
      subtitle: `${siteTitle} cosmetic subtitle`,
      items: [{ id: 'p1', title: `${siteTitle} cream`, description: 'Cream details', price: '5000', imageUrl: '' }],
    },
  }
}

const logs: SiteAuditLog[] = [
  {
    id: 'latest',
    actorEmail: 'editor@example.com',
    section: 'Hero',
    summary: 'Updated hero.',
    createdAt: '2026-05-04T10:30:00.000Z',
    beforeConfig: config('Previous'),
    afterConfig: config('Newest'),
  },
  {
    id: 'older',
    actorEmail: 'editor@example.com',
    section: 'Services',
    summary: 'Updated services.',
    createdAt: '2026-05-04T09:30:00.000Z',
    beforeConfig: config('Older'),
    afterConfig: config('Previous'),
  },
]

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue({ restored: false, error: 'Rollback failed.' }),
  }))
})

describe('admin history panel', () => {
  it('reveals a visual before and after diff when a history entry is clicked', async () => {
    const user = userEvent.setup()
    render(
      <AdminForms
        config={config('Newest')}
        userEmail="aminumohammed@kardinalpharmacy.com"
        admins={['aminumohammed@kardinalpharmacy.com']}
        auditLogs={logs}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'History' }))

    expect(screen.getByText('Before')).toBeInTheDocument()
    expect(screen.getByText('After')).toBeInTheDocument()
    expect(screen.getByText('Previous primary')).toBeInTheDocument()
    expect(screen.getByText('Newest primary')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Updated services/i }))

    expect(screen.getByText('Older services')).toBeInTheDocument()
    expect(screen.getByText('Previous services')).toBeInTheDocument()
  })

  it('prevents restoring the latest after snapshot but allows older after snapshots', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.mocked(fetch)
    render(
      <AdminForms
        config={config('Newest')}
        userEmail="aminumohammed@kardinalpharmacy.com"
        admins={['aminumohammed@kardinalpharmacy.com']}
        auditLogs={logs}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'History' }))

    expect(screen.getByRole('button', { name: 'Current version' })).toBeDisabled()

    const olderEntry = screen.getByRole('button', { name: /Updated services/i }).closest('div')
    expect(olderEntry).not.toBeNull()
    await user.click(screen.getByRole('button', { name: /Updated services/i }))
    await user.click(within(olderEntry as HTMLElement).getByRole('button', { name: 'Restore after' }))

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/audit/rollback', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ id: 'older', snapshot: 'after' }),
    }))
  })
})
