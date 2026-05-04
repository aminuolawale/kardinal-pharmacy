import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SiteConfig } from '@/lib/types'

const { getSqlMock } = vi.hoisted(() => ({
  getSqlMock: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  getSql: getSqlMock,
}))

const config: SiteConfig = {
  siteTitle: 'Kardinal Pharmacy',
  hero: { headlinePrimary: 'Primary', headlineEmphasis: 'Emphasis', subtitle: 'Subtitle' },
  pharmacist: {
    name: 'Pharm. Test',
    description: 'Pharmacist',
    credentials: [],
    profileDescription: 'Profile',
    avatarUrl: '',
  },
  services: { headline: 'Services', subtitle: 'Service sub', items: [] },
  trust: { items: [] },
  cosmeticLine: { headline: 'Cosmetics', subtitle: 'Cosmetic sub', items: [] },
}

beforeEach(() => {
  vi.resetModules()
  getSqlMock.mockReset()
  getSqlMock.mockReturnValue(null)
})

describe('site audit storage', () => {
  it('does nothing when Neon is not configured', async () => {
    const { getSiteAuditLog, getSiteAuditLogs, recordSiteEdit } = await import('@/lib/audit')

    await expect(recordSiteEdit({
      actorEmail: 'editor@example.com',
      section: 'Hero',
      summary: 'Updated hero.',
      beforeConfig: config,
      afterConfig: { ...config, siteTitle: 'Updated' },
    })).resolves.toBeNull()
    await expect(getSiteAuditLogs()).resolves.toEqual([])
    await expect(getSiteAuditLog('missing')).resolves.toBeNull()
  })

  it('records and maps a site edit audit row from Neon', async () => {
    const row = {
      id: 'audit-1',
      actor_email: 'editor@example.com',
      section: 'Hero',
      summary: 'Updated hero.',
      created_at: '2026-05-04T10:30:00.000Z',
      before_config: config,
      after_config: { ...config, siteTitle: 'Updated' },
    }
    const sqlMock = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([row])
    getSqlMock.mockReturnValue(sqlMock)
    const { recordSiteEdit } = await import('@/lib/audit')

    await expect(recordSiteEdit({
      actorEmail: 'editor@example.com',
      section: 'Hero',
      summary: 'Updated hero.',
      beforeConfig: config,
      afterConfig: { ...config, siteTitle: 'Updated' },
    })).resolves.toEqual({
      id: 'audit-1',
      actorEmail: 'editor@example.com',
      section: 'Hero',
      summary: 'Updated hero.',
      createdAt: '2026-05-04T10:30:00.000Z',
      beforeConfig: config,
      afterConfig: { ...config, siteTitle: 'Updated' },
    })
    expect(sqlMock).toHaveBeenCalledTimes(2)
  })

  it('reads the latest audit logs and a single audit log', async () => {
    const row = {
      id: 'audit-2',
      actor_email: 'super@example.com',
      section: 'Rollback',
      summary: 'Restored content.',
      created_at: new Date('2026-05-04T12:00:00.000Z'),
      before_config: { ...config, siteTitle: 'Current' },
      after_config: config,
    }
    const sqlMock = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([row])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([row])
    getSqlMock.mockReturnValue(sqlMock)
    const { getSiteAuditLog, getSiteAuditLogs } = await import('@/lib/audit')

    await expect(getSiteAuditLogs(5)).resolves.toEqual([{
      id: 'audit-2',
      actorEmail: 'super@example.com',
      section: 'Rollback',
      summary: 'Restored content.',
      createdAt: '2026-05-04T12:00:00.000Z',
      beforeConfig: { ...config, siteTitle: 'Current' },
      afterConfig: config,
    }])
    await expect(getSiteAuditLog('audit-2')).resolves.toMatchObject({
      id: 'audit-2',
      actorEmail: 'super@example.com',
      section: 'Rollback',
    })
    expect(sqlMock).toHaveBeenCalledTimes(4)
  })
})
