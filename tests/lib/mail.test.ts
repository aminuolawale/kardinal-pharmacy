import { afterEach, describe, expect, it, vi } from 'vitest'

const getConfigMock = vi.fn()

vi.mock('@/lib/config', () => ({
  getConfig: getConfigMock,
}))

const ORIGINAL_ENV = process.env

afterEach(() => {
  process.env = ORIGINAL_ENV
  vi.restoreAllMocks()
  getConfigMock.mockReset()
})

describe('mail helpers', () => {
  it('sends email through Resend with the configured sender', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      RESEND_API_KEY: 'resend-key',
      ADMIN_EMAIL_FROM: 'Kardinal <admin@kardinalpharmacy.com>',
    }
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    const { sendEmail } = await import('@/lib/mail')

    await sendEmail({
      to: 'newadmin@example.com',
      subject: 'Subject',
      html: '<p>Hello</p>',
      text: 'Hello',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer resend-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Kardinal <admin@kardinalpharmacy.com>',
          to: 'newadmin@example.com',
          subject: 'Subject',
          html: '<p>Hello</p>',
          text: 'Hello',
        }),
      }),
    )
  })

  it('fails clearly when email credentials are not configured', async () => {
    process.env = { ...ORIGINAL_ENV, RESEND_API_KEY: '', ADMIN_EMAIL_FROM: '' }
    const { sendEmail } = await import('@/lib/mail')

    await expect(
      sendEmail({ to: 'a@example.com', subject: 'Hi', html: '<p>Hi</p>', text: 'Hi' }),
    ).rejects.toThrow('Email is not configured')
  })

  it('builds a new-admin message with live links and escaped HTML', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      RESEND_API_KEY: 'resend-key',
      ADMIN_EMAIL_FROM: 'admin@kardinalpharmacy.com',
      SITE_URL: 'https://www.kardinalpharmacy.com/',
    }
    getConfigMock.mockResolvedValue({ siteTitle: 'Kardinal <Pharmacy>' })
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    const { sendNewAdminEmail } = await import('@/lib/mail')

    await sendNewAdminEmail('newadmin@kardinalpharmacy.com')

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.subject).toBe('You are now an admin for Kardinal <Pharmacy>')
    expect(body.text).toContain('https://www.kardinalpharmacy.com/admin/login')
    expect(body.text).toContain('newadmin@kardinalpharmacy.com')
    expect(body.html).toContain('Kardinal &lt;Pharmacy&gt;')
    expect(body.html).toContain('https://www.kardinalpharmacy.com/admin/login')
  })
})

