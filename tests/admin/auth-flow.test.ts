import { describe, expect, it, vi } from 'vitest'

const { nextAuthMock, googleMock, readAdminsMock, sendAdminSignedInEmailMock } = vi.hoisted(() => ({
  nextAuthMock: vi.fn(() => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    signIn: vi.fn(),
    signOut: vi.fn(),
    auth: vi.fn(),
  })),
  googleMock: vi.fn((options) => ({ id: 'google', type: 'oidc', ...options })),
  readAdminsMock: vi.fn(),
  sendAdminSignedInEmailMock: vi.fn(),
}))

vi.mock('next-auth', () => ({
  default: nextAuthMock,
}))

vi.mock('next-auth/providers/google', () => ({
  default: googleMock,
}))

vi.mock('@/lib/admins', () => ({
  SUPER_ADMIN: 'aminumohammed@kardinalpharmacy.com',
  readAdmins: readAdminsMock,
}))

vi.mock('@/lib/mail', () => ({
  sendAdminSignedInEmail: sendAdminSignedInEmailMock,
}))

describe('NextAuth admin configuration', () => {
  it('configures Google with explicit provider credentials and preserves auth callbacks', async () => {
    vi.resetModules()
    process.env.AUTH_GOOGLE_ID = 'google-id'
    process.env.AUTH_GOOGLE_SECRET = 'google-secret'

    await import('@/auth')

    const config = nextAuthMock.mock.calls.at(-1)?.[0]
    expect(googleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'google-id',
        clientSecret: 'google-secret',
        authorization: { params: { prompt: 'select_account' } },
      }),
    )
    expect(config.providers).toHaveLength(1)
    expect(config.callbacks.authorized).toEqual(expect.any(Function))
    expect(config.callbacks.signIn).toEqual(expect.any(Function))
  })

  it('allows the super admin to sign in without reading the admin file', async () => {
    vi.resetModules()
    await import('@/auth')
    const config = nextAuthMock.mock.calls.at(-1)?.[0]

    await expect(
      config.callbacks.signIn({ user: { email: 'AminuMohammed@KardinalPharmacy.com' } }),
    ).resolves.toBe(true)
    expect(readAdminsMock).not.toHaveBeenCalled()
    expect(sendAdminSignedInEmailMock).not.toHaveBeenCalled()
  })

  it('allows listed admins, notifies the super admin, and denies unknown Google accounts', async () => {
    vi.resetModules()
    sendAdminSignedInEmailMock.mockResolvedValue(undefined)
    readAdminsMock.mockResolvedValue({ emails: ['listed@example.com'] })
    await import('@/auth')
    const config = nextAuthMock.mock.calls.at(-1)?.[0]

    await expect(config.callbacks.signIn({ user: { email: 'LISTED@example.com' } })).resolves.toBe(true)
    await expect(config.callbacks.signIn({ user: { email: 'unknown@example.com' } })).resolves.toBe(false)
    expect(sendAdminSignedInEmailMock).toHaveBeenCalledTimes(1)
    expect(sendAdminSignedInEmailMock).toHaveBeenCalledWith('listed@example.com')
  })

  it('does not block listed admin sign-in if notification email fails', async () => {
    vi.resetModules()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    readAdminsMock.mockResolvedValue({ emails: ['listed@example.com'] })
    sendAdminSignedInEmailMock.mockRejectedValue(new Error('mail down'))
    await import('@/auth')
    const config = nextAuthMock.mock.calls.at(-1)?.[0]

    await expect(config.callbacks.signIn({ user: { email: 'listed@example.com' } })).resolves.toBe(true)
  })

  it('keeps redirects on the same origin', async () => {
    vi.resetModules()
    await import('@/auth')
    const config = nextAuthMock.mock.calls.at(-1)?.[0]

    expect(config.callbacks.redirect({ url: '/admin/panel', baseUrl: 'https://site.test' })).toBe(
      'https://site.test/admin/panel',
    )
    expect(
      config.callbacks.redirect({
        url: 'https://site.test/admin/login',
        baseUrl: 'https://site.test',
      }),
    ).toBe('https://site.test/admin/login')
    expect(
      config.callbacks.redirect({
        url: 'https://evil.test/admin/login',
        baseUrl: 'https://site.test',
      }),
    ).toBe('https://site.test')
  })
})
