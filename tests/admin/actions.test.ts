import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.fn()
const signOutMock = vi.fn()
const redirectMock = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`)
})
const getAdminsMock = vi.fn()
const saveAdminsMock = vi.fn()
const sendNewAdminEmailMock = vi.fn()
const sendSiteEditReportEmailMock = vi.fn()
const getConfigMock = vi.fn()
const saveConfigMock = vi.fn()
const recordSiteEditMock = vi.fn()
const revalidatePathMock = vi.fn()

vi.mock('@/auth', () => ({
  auth: authMock,
  signOut: signOutMock,
}))

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}))

vi.mock('@/lib/admins', () => ({
  SUPER_ADMIN: 'aminumohammed@kardinalpharmacy.com',
  getAdmins: getAdminsMock,
  saveAdmins: saveAdminsMock,
}))

vi.mock('@/lib/config', () => ({
  getConfig: getConfigMock,
  saveConfig: saveConfigMock,
}))

vi.mock('@/lib/mail', () => ({
  sendNewAdminEmail: sendNewAdminEmailMock,
  sendSiteEditReportEmail: sendSiteEditReportEmailMock,
}))

vi.mock('@/lib/audit', () => ({
  recordSiteEdit: recordSiteEditMock,
}))

beforeEach(() => {
  authMock.mockReset()
  signOutMock.mockReset()
  redirectMock.mockClear()
  getAdminsMock.mockReset()
  saveAdminsMock.mockReset()
  sendNewAdminEmailMock.mockReset()
  sendSiteEditReportEmailMock.mockReset()
  getConfigMock.mockReset()
  saveConfigMock.mockReset()
  recordSiteEditMock.mockReset()
  revalidatePathMock.mockReset()
})

describe('admin auth actions', () => {
  it('logs out to the admin login page', async () => {
    const { logout } = await import('@/app/admin/actions')

    await logout()

    expect(signOutMock).toHaveBeenCalledWith({ redirectTo: '/admin/login' })
  })
})

describe('admin management actions', () => {
  it('adds a new admin and sends the invitation email', async () => {
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    getAdminsMock.mockResolvedValue({ emails: ['aminumohammed@kardinalpharmacy.com'] })
    sendNewAdminEmailMock.mockResolvedValue(undefined)
    const { addAdmin } = await import('@/app/admin/actions')

    await expect(addAdmin(' NewAdmin@Example.com ')).resolves.toEqual({
      added: true,
      emailSent: true,
    })

    expect(saveAdminsMock).toHaveBeenCalledWith({
      emails: ['aminumohammed@kardinalpharmacy.com', 'newadmin@example.com'],
    })
    expect(sendNewAdminEmailMock).toHaveBeenCalledWith('newadmin@example.com')
  })

  it('adds the admin but reports when the notification email fails', async () => {
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    getAdminsMock.mockResolvedValue({ emails: ['aminumohammed@kardinalpharmacy.com'] })
    sendNewAdminEmailMock.mockRejectedValue(new Error('Provider down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { addAdmin } = await import('@/app/admin/actions')

    await expect(addAdmin('newadmin@example.com')).resolves.toEqual({
      added: true,
      emailSent: false,
      error: 'Admin added, but the notification email could not be sent.',
    })

    expect(saveAdminsMock).toHaveBeenCalled()
  })

  it('does not add duplicate admins case-insensitively', async () => {
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    getAdminsMock.mockResolvedValue({ emails: ['existing@example.com'] })
    const { addAdmin } = await import('@/app/admin/actions')

    await expect(addAdmin('Existing@Example.com')).resolves.toEqual({
      added: false,
      emailSent: false,
      error: 'This admin already exists.',
    })

    expect(saveAdminsMock).not.toHaveBeenCalled()
    expect(sendNewAdminEmailMock).not.toHaveBeenCalled()
  })

  it('rejects invalid admin emails without writing', async () => {
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    const { addAdmin } = await import('@/app/admin/actions')

    await expect(addAdmin('not-an-email')).resolves.toEqual({
      added: false,
      emailSent: false,
      error: 'Enter a valid email address.',
    })

    expect(saveAdminsMock).not.toHaveBeenCalled()
  })

  it('prevents non-super admins from managing admins', async () => {
    authMock.mockResolvedValue({ user: { email: 'regular@example.com' } })
    const { addAdmin } = await import('@/app/admin/actions')

    await expect(addAdmin('newadmin@example.com')).rejects.toThrow('REDIRECT:/admin/login')
    expect(saveAdminsMock).not.toHaveBeenCalled()
  })

  it('does not remove the super admin', async () => {
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    const { removeAdmin } = await import('@/app/admin/actions')

    await removeAdmin('aminumohammed@kardinalpharmacy.com')

    expect(saveAdminsMock).not.toHaveBeenCalled()
  })

  it('removes non-super admins case-insensitively', async () => {
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    getAdminsMock.mockResolvedValue({
      emails: ['aminumohammed@kardinalpharmacy.com', 'remove@example.com', 'keep@example.com'],
    })
    const { removeAdmin } = await import('@/app/admin/actions')

    await removeAdmin('Remove@Example.com')

    expect(saveAdminsMock).toHaveBeenCalledWith({
      emails: ['aminumohammed@kardinalpharmacy.com', 'keep@example.com'],
    })
  })
})

describe('protected site-content actions', () => {
  it('allows listed admins to update site content', async () => {
    authMock.mockResolvedValue({ user: { email: 'editor@example.com' } })
    getAdminsMock.mockResolvedValue({ emails: ['editor@example.com'] })
    getConfigMock.mockResolvedValue({ siteTitle: 'Old title', hero: {} })
    recordSiteEditMock.mockResolvedValue({ createdAt: '2026-05-04T10:30:00.000Z' })
    sendSiteEditReportEmailMock.mockResolvedValue(undefined)
    const { saveSiteTitle } = await import('@/app/admin/actions')

    await saveSiteTitle('New title')

    expect(saveConfigMock).toHaveBeenCalledWith({ siteTitle: 'New title', hero: {} })
    expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout')
    expect(recordSiteEditMock).toHaveBeenCalledWith({
      actorEmail: 'editor@example.com',
      section: 'Site title',
      summary: 'Updated site title from "Old title" to "New title".',
      beforeConfig: { siteTitle: 'Old title', hero: {} },
      afterConfig: { siteTitle: 'New title', hero: {} },
    })
    expect(sendSiteEditReportEmailMock).toHaveBeenCalledWith({
      actorEmail: 'editor@example.com',
      section: 'Site title',
      summary: 'Updated site title from "Old title" to "New title".',
      editedAt: '2026-05-04T10:30:00.000Z',
      afterConfig: { siteTitle: 'New title', hero: {} },
    })
  })

  it('still saves content when audit email delivery fails', async () => {
    authMock.mockResolvedValue({ user: { email: 'editor@example.com' } })
    getAdminsMock.mockResolvedValue({ emails: ['editor@example.com'] })
    getConfigMock.mockResolvedValue({ siteTitle: 'Old title', hero: {} })
    recordSiteEditMock.mockRejectedValue(new Error('audit down'))
    sendSiteEditReportEmailMock.mockRejectedValue(new Error('mail down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { saveSiteTitle } = await import('@/app/admin/actions')

    await expect(saveSiteTitle('New title')).resolves.toBeUndefined()

    expect(saveConfigMock).toHaveBeenCalledWith({ siteTitle: 'New title', hero: {} })
    expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout')
  })

  it('redirects removed admins away from protected actions', async () => {
    authMock.mockResolvedValue({ user: { email: 'removed@example.com' } })
    getAdminsMock.mockResolvedValue({ emails: ['someone@example.com'] })
    const { saveSiteTitle } = await import('@/app/admin/actions')

    await expect(saveSiteTitle('New title')).rejects.toThrow('REDIRECT:/admin/login')
    expect(saveConfigMock).not.toHaveBeenCalled()
  })
})
