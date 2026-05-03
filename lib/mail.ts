import { getConfig } from './config'

function firstEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }
}

function getSiteUrl(): string {
  const configuredUrl = firstEnv('NEXT_PUBLIC_SITE_URL', 'SITE_URL', 'AUTH_URL', 'NEXTAUTH_URL')
  if (configuredUrl) return configuredUrl.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const apiKey = firstEnv('RESEND_API_KEY')
  const from = firstEnv('ADMIN_EMAIL_FROM', 'EMAIL_FROM')

  if (!apiKey || !from) {
    throw new Error('Email is not configured. Set RESEND_API_KEY and ADMIN_EMAIL_FROM.')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Email provider rejected the message: ${message}`)
  }
}

export async function sendNewAdminEmail(to: string) {
  const config = await getConfig()
  const siteName = config.siteTitle || 'Kardinal Pharmacy'
  const siteUrl = getSiteUrl()
  const adminUrl = `${siteUrl}/admin/login`
  const safeSiteName = escapeHtml(siteName)
  const safeAdminUrl = escapeHtml(adminUrl)
  const safeSiteUrl = escapeHtml(siteUrl)

  await sendEmail({
    to,
    subject: `You are now an admin for ${siteName}`,
    text: [
      `You have been added as an admin for ${siteName}.`,
      '',
      `Site: ${siteUrl}`,
      `Admin page: ${adminUrl}`,
      '',
      'To access the admin page:',
      '1. Open the admin page link.',
      '2. Click "Continue with Google".',
      `3. Sign in with this exact Google account: ${to}`,
      '',
      'If you were not expecting this, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2933;">
        <p>You have been added as an admin for <strong>${safeSiteName}</strong>.</p>
        <p>
          Site: <a href="${safeSiteUrl}">${safeSiteUrl}</a><br>
          Admin page: <a href="${safeAdminUrl}">${safeAdminUrl}</a>
        </p>
        <p>To access the admin page:</p>
        <ol>
          <li>Open the admin page link.</li>
          <li>Click <strong>Continue with Google</strong>.</li>
          <li>Sign in with this exact Google account: <strong>${escapeHtml(to)}</strong>.</li>
        </ol>
        <p>If you were not expecting this, you can ignore this email.</p>
      </div>
    `,
  })
}

