import { getConfig } from './config'
import { SUPER_ADMIN } from './constants'
import type { SiteConfig } from './types'

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
      'You can also access the admin page by clicking on the space between the site title and nav buttons 4 times',
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

export async function sendAdminSignedInEmail(adminEmail: string) {
  const config = await getConfig()
  const siteName = config.siteTitle || 'Kardinal Pharmacy'
  const siteUrl = getSiteUrl()
  const adminUrl = `${siteUrl}/admin/panel`
  const safeSiteName = escapeHtml(siteName)
  const safeAdminEmail = escapeHtml(adminEmail)
  const safeAdminUrl = escapeHtml(adminUrl)

  await sendEmail({
    to: 'aminumohammed@kardinalpharmacy.com',
    subject: `${adminEmail} signed in to ${siteName}`,
    text: [
      `${adminEmail} signed in to the ${siteName} admin panel.`,
      '',
      `Admin panel: ${adminUrl}`,
      '',
      'This notification is sent when an invited admin successfully signs in.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2933;">
        <p><strong>${safeAdminEmail}</strong> signed in to the <strong>${safeSiteName}</strong> admin panel.</p>
        <p>Admin panel: <a href="${safeAdminUrl}">${safeAdminUrl}</a></p>
        <p>This notification is sent when an invited admin successfully signs in.</p>
      </div>
    `,
  })
}

export async function sendSiteEditReportEmail({
  actorEmail,
  section,
  summary,
  editedAt,
  afterConfig,
}: {
  actorEmail: string
  section: string
  summary: string
  editedAt: string
  afterConfig: SiteConfig
}) {
  const siteName = afterConfig.siteTitle || 'Kardinal Pharmacy'
  const siteUrl = getSiteUrl()
  const adminUrl = `${siteUrl}/admin/panel`
  const formattedTime = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  }).format(new Date(editedAt))

  await sendEmail({
    to: SUPER_ADMIN,
    subject: `${section} was edited on ${siteName}`,
    text: [
      `${actorEmail} edited ${section}.`,
      '',
      `Summary: ${summary}`,
      `Time: ${formattedTime}`,
      `Admin panel: ${adminUrl}`,
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2933;">
        <p><strong>${escapeHtml(actorEmail)}</strong> edited <strong>${escapeHtml(section)}</strong>.</p>
        <p>
          Summary: ${escapeHtml(summary)}<br>
          Time: ${escapeHtml(formattedTime)}
        </p>
        <p>Admin panel: <a href="${escapeHtml(adminUrl)}">${escapeHtml(adminUrl)}</a></p>
      </div>
    `,
  })
}
