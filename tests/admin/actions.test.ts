import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.fn()
const signInMock = vi.fn()
const signOutMock = vi.fn()
const redirectMock = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`)
})
const getAdminsMock = vi.fn()
const saveAdminsMock = vi.fn()
const sendNewAdminEmailMock = vi.fn()
const getConfigMock = vi.fn()
const saveConfigMock = vi.fn()
const revalidatePathMock = vi.fn()

vi.mock('@/auth', () => ({
  auth: authMock,
  signIn: signInMock,
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
}))

beforeEach(() => {
  authMock.mockReset()
  signInMock.mockReset()
  signOutMock.mockReset()
  redirectMock.mockClear()
  getAdminsMock.mockReset()
  saveAdminsMock.mockReset()
  sendNewAdminEmailMock.mockReset()
  getConfigMock.mockReset()
  saveConfigMock.mockReset()
  revalidatePathMock.mockReset()
})

describe('admin auth actions', () => {
  it('starts the Google sign-in flow with the admin panel callback', async () => {
    const { loginWithGoogle } = await import('@/app/admin/actions')

    await loginWithGoogle()

    expect(signInMock).toHaveBeenCalledWith('google', { redirectTo: '/admin/panel' })
  })

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
    const { saveSiteTitle } = await import('@/app/admin/actions')

    await saveSiteTitle('New title')

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

