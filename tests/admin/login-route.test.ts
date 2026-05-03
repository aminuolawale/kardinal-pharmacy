import { describe, expect, it, vi } from 'vitest'

const signInMock = vi.fn()

vi.mock('@/auth', () => ({
  signIn: signInMock,
}))

describe('admin Google login route', () => {
  it('starts Google sign-in with the admin panel callback', async () => {
    const { GET } = await import('@/app/admin/login/google/route')

    await GET()

    expect(signInMock).toHaveBeenCalledWith('google', { redirectTo: '/admin/panel' })
  })
})

