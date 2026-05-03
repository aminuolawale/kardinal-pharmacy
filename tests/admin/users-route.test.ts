import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.fn()
const getAdminsMock = vi.fn()
const saveAdminsMock = vi.fn()
const sendNewAdminEmailMock = vi.fn()

vi.mock('@/auth', () => ({
  auth: authMock,
}))

vi.mock('@/lib/admins', () => ({
  SUPER_ADMIN: 'aminumohammed@kardinalpharmacy.com',
  getAdmins: getAdminsMock,
  saveAdmins: saveAdminsMock,
}))

vi.mock('@/lib/mail', () => ({
  sendNewAdminEmail: sendNewAdminEmailMock,
}))

function jsonRequest(body: unknown) {
  return new Request('https://www.kardinalpharmacy.com/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  authMock.mockReset()
  getAdminsMock.mockReset()
  saveAdminsMock.mockReset()
  sendNewAdminEmailMock.mockReset()
})

describe('/api/admin/users', () => {
  it('rejects non-super admins', async () => {
    authMock.mockResolvedValue({ user: { email: 'regular@example.com' } })
    const { POST } = await import('@/app/api/admin/users/route')

    const response = await POST(jsonRequest({ email: 'new@example.com' }))

    expect(response.status).toBe(401)
    expect(saveAdminsMock).not.toHaveBeenCalled()
  })

  it('adds admins through a stable API route', async () => {
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    getAdminsMock.mockResolvedValue({ emails: ['aminumohammed@kardinalpharmacy.com'] })
    sendNewAdminEmailMock.mockResolvedValue(undefined)
    const { POST } = await import('@/app/api/admin/users/route')

    const response = await POST(jsonRequest({ email: 'New@Example.com' }))

    await expect(response.json()).resolves.toEqual({ added: true, emailSent: true })
    expect(saveAdminsMock).toHaveBeenCalledWith({
      emails: ['aminumohammed@kardinalpharmacy.com', 'new@example.com'],
    })
  })

  it('reports saved admins when notification email fails', async () => {
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    getAdminsMock.mockResolvedValue({ emails: ['aminumohammed@kardinalpharmacy.com'] })
    saveAdminsMock.mockResolvedValue(undefined)
    sendNewAdminEmailMock.mockRejectedValue(new Error('mail down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { POST } = await import('@/app/api/admin/users/route')

    const response = await POST(jsonRequest({ email: 'new@example.com' }))

    await expect(response.json()).resolves.toEqual({
      added: true,
      emailSent: false,
      error: 'Admin added, but the notification email could not be sent.',
    })
  })

  it('removes non-super admins', async () => {
    authMock.mockResolvedValue({ user: { email: 'aminumohammed@kardinalpharmacy.com' } })
    getAdminsMock.mockResolvedValue({
      emails: ['aminumohammed@kardinalpharmacy.com', 'remove@example.com', 'keep@example.com'],
    })
    const { DELETE } = await import('@/app/api/admin/users/route')

    const response = await DELETE(jsonRequest({ email: 'Remove@Example.com' }))

    await expect(response.json()).resolves.toEqual({ removed: true })
    expect(saveAdminsMock).toHaveBeenCalledWith({
      emails: ['aminumohammed@kardinalpharmacy.com', 'keep@example.com'],
    })
  })
})

