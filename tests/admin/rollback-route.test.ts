import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SiteConfig, SiteAuditLog } from '@/lib/types'

const {
  authMock,
  getSiteAuditLogMock,
  getSiteAuditLogsMock,
  recordSiteEditMock,
  getConfigMock,
  saveConfigMock,
  revalidatePathMock,
  sendSiteEditReportEmailMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  getSiteAuditLogMock: vi.fn(),
  getSiteAuditLogsMock: vi.fn(),
  recordSiteEditMock: vi.fn(),
  getConfigMock: vi.fn(),
  saveConfigMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  sendSiteEditReportEmailMock: vi.fn(),
}))

vi.mock('@/auth', () => ({
  auth: authMock,
}))

vi.mock('@/lib/admins', () => ({
  SUPER_ADMIN: 'aminumohammed@kardinalpharmacy.com',
}))

vi.mock('@/lib/audit', () => ({
  getSiteAuditLog: getSiteAuditLogMock,
  getSiteAuditLogs: getSiteAuditLogsMock,
  recordSiteEdit: recordSiteEditMock,
}))

vi.mock('@/lib/config', () => ({
  getConfig: getConfigMock,
  saveConfig: saveConfigMock,
}))

vi.mock('@/lib/mail', () => ({
  sendSiteEditReportEmail: sendSiteEditReportEmailMock,
}))

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}))

function siteConfig(siteTitle: string): SiteConfig {
  return {
    siteTitle,
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
}

function jsonRequest(body: unknown) {
  return new Request('https://www.kardinalpharmacy.com/api/admin/audit/rollback', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.resetModules()
  authMock.mockReset()
  getSiteAuditLogMock.mockReset()
  getSiteAuditLogsMock.mockReset()
  recordSiteEditMock.mockReset()
  getConfigMock.mockReset()
  saveConfigMock.mockReset()
  revalidatePathMock.mockReset()
  sendSiteEditReportEmailMock.mockReset()
})

describe('/api/admin/audit/rollback', () => {
  it('rejects non-super admins', async () => {
    authMock.mockResolvedValue({ user: { email: 'editor@example.com' } })
    const { POST } = await import('@/app/api/admin/audit/rollback/route')

    const response = await POST(jsonRequest({ id: 'audit-1' }))

    expect(response.status).toBe(401)
    expect(saveConfigMock).not.toHaveBeenCalled()
  })

  it('rejects missing audit ids', async () => {
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    const { POST } = await import('@/app/api/admin/audit/rollback/route')

    const response = await POST(jsonRequest({}))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      restored: false,
      error: 'Missing audit log id.',
    })
  })

  it('returns not found when the audit log does not exist', async () => {
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    getSiteAuditLogMock.mockResolvedValue(null)
    const { POST } = await import('@/app/api/admin/audit/rollback/route')

    const response = await POST(jsonRequest({ id: 'missing' }))

    expect(response.status).toBe(404)
    expect(saveConfigMock).not.toHaveBeenCalled()
  })

  it('restores the selected after snapshot and records the rollback', async () => {
    const beforeConfig = siteConfig('Current title')
    const restoredConfig = siteConfig('Selected version')
    const auditLog: SiteAuditLog = {
      id: 'audit-1',
      actorEmail: 'editor@example.com',
      section: 'Hero',
      summary: 'Updated hero.',
      createdAt: '2026-05-04T08:00:00.000Z',
      beforeConfig: siteConfig('Older title'),
      afterConfig: restoredConfig,
    }
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    getSiteAuditLogMock.mockResolvedValue(auditLog)
    getSiteAuditLogsMock.mockResolvedValue([{ id: 'newer-audit' }])
    getConfigMock.mockResolvedValue(beforeConfig)
    recordSiteEditMock.mockResolvedValue({ createdAt: '2026-05-04T10:30:00.000Z' })
    sendSiteEditReportEmailMock.mockResolvedValue(undefined)
    const { POST } = await import('@/app/api/admin/audit/rollback/route')

    const response = await POST(jsonRequest({ id: 'audit-1', snapshot: 'after' }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ restored: true })
    expect(saveConfigMock).toHaveBeenCalledWith(restoredConfig)
    expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout')
    expect(recordSiteEditMock).toHaveBeenCalledWith({
      actorEmail: 'aminumohammed@kardinalpharmacy.com',
      section: 'Rollback',
      summary: expect.stringContaining('Restored site to the after snapshot from'),
      beforeConfig,
      afterConfig: restoredConfig,
    })
    expect(sendSiteEditReportEmailMock).toHaveBeenCalledWith({
      actorEmail: 'aminumohammed@kardinalpharmacy.com',
      section: 'Rollback',
      summary: expect.stringContaining('after "Hero" was edited.'),
      editedAt: '2026-05-04T10:30:00.000Z',
      afterConfig: restoredConfig,
    })
  })

  it('rejects restoring the after snapshot for the latest revision', async () => {
    const auditLog: SiteAuditLog = {
      id: 'latest',
      actorEmail: 'editor@example.com',
      section: 'Hero',
      summary: 'Updated hero.',
      createdAt: '2026-05-04T11:00:00.000Z',
      beforeConfig: siteConfig('Before'),
      afterConfig: siteConfig('Current'),
    }
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    getSiteAuditLogMock.mockResolvedValue(auditLog)
    getSiteAuditLogsMock.mockResolvedValue([{ id: 'latest' }])
    const { POST } = await import('@/app/api/admin/audit/rollback/route')

    const response = await POST(jsonRequest({ id: 'latest', snapshot: 'after' }))

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      restored: false,
      error: 'This revision is already the current saved version.',
    })
    expect(saveConfigMock).not.toHaveBeenCalled()
  })

  it('can restore the before snapshot from a change', async () => {
    const currentConfig = siteConfig('Current title')
    const beforeSnapshot = siteConfig('Before edit')
    const auditLog: SiteAuditLog = {
      id: 'audit-2',
      actorEmail: 'editor@example.com',
      section: 'Services',
      summary: 'Updated services.',
      createdAt: '2026-05-04T09:00:00.000Z',
      beforeConfig: beforeSnapshot,
      afterConfig: siteConfig('After edit'),
    }
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    getSiteAuditLogMock.mockResolvedValue(auditLog)
    getConfigMock.mockResolvedValue(currentConfig)
    recordSiteEditMock.mockResolvedValue(null)
    sendSiteEditReportEmailMock.mockResolvedValue(undefined)
    const { POST } = await import('@/app/api/admin/audit/rollback/route')

    const response = await POST(jsonRequest({ id: 'audit-2', snapshot: 'before' }))

    expect(response.status).toBe(200)
    expect(saveConfigMock).toHaveBeenCalledWith(beforeSnapshot)
    expect(recordSiteEditMock).toHaveBeenCalledWith(expect.objectContaining({
      section: 'Rollback',
      summary: expect.stringContaining('Restored site to the before snapshot from'),
      beforeConfig: currentConfig,
      afterConfig: beforeSnapshot,
    }))
  })
})
