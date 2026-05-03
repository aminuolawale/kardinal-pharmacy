import { beforeEach, describe, expect, it, vi } from 'vitest'

const { nextAuthMock, redirectMock } = vi.hoisted(() => ({
  nextAuthMock: vi.fn(() => ({
    auth: (handler: (req: { auth: unknown; nextUrl: URL; url: string }) => Response | undefined) => handler,
  })),
  redirectMock: vi.fn((url: URL) => ({ redirectedTo: url.toString() })),
}))

vi.mock('next-auth', () => ({
  default: nextAuthMock,
}))

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: redirectMock,
  },
}))

function request(path: string, auth: unknown = null) {
  const url = `https://www.kardinalpharmacy.com${path}`
  return {
    auth,
    url,
    nextUrl: new URL(url),
  }
}

beforeEach(() => {
  redirectMock.mockClear()
})

describe('admin middleware routing', () => {
  it('allows the login page to render whether or not a session exists', async () => {
    const middleware = (await import('@/middleware')).default

    expect(middleware(request('/admin/login'))).toBeUndefined()
    expect(middleware(request('/admin/login', { user: { email: 'admin@example.com' } }))).toBeUndefined()
  })

  it('allows the Google login start route for unauthenticated users', async () => {
    const middleware = (await import('@/middleware')).default

    expect(middleware(request('/admin/login/google'))).toBeUndefined()
  })

  it('redirects unauthenticated admin pages to login', async () => {
    const middleware = (await import('@/middleware')).default

    expect(middleware(request('/admin/panel'))).toEqual({
      redirectedTo: 'https://www.kardinalpharmacy.com/admin/login',
    })
  })

  it('redirects /admin to the login page without using Auth.js signout', async () => {
    const middleware = (await import('@/middleware')).default

    expect(middleware(request('/admin', { user: { email: 'admin@example.com' } }))).toEqual({
      redirectedTo: 'https://www.kardinalpharmacy.com/admin/login',
    })
    expect(redirectMock.mock.calls[0][0].pathname).toBe('/admin/login')
  })

  it('allows authenticated admin subpages through', async () => {
    const middleware = (await import('@/middleware')).default

    expect(middleware(request('/admin/panel', { user: { email: 'admin@example.com' } }))).toBeUndefined()
  })
})
