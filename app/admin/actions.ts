'use server'
import fs from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { getConfig, saveConfig } from '@/lib/config'
import { getAdmins, saveAdmins, SUPER_ADMIN } from '@/lib/admins'
import { recordSiteEdit } from '@/lib/audit'
import { sendNewAdminEmail, sendSiteEditReportEmail } from '@/lib/mail'
import type { SiteConfig } from '@/lib/types'

async function requireAuth() {
  const session = await auth()
  const email = session?.user?.email?.toLowerCase()
  if (!email) redirect('/admin/login')

  if (email === SUPER_ADMIN.toLowerCase()) return email

  const { emails } = await getAdmins()
  if (!emails.some((adminEmail) => adminEmail.toLowerCase() === email)) {
    redirect('/admin/login')
  }

  return email
}

async function requireSuperAdmin() {
  const session = await auth()
  const email = session?.user?.email?.toLowerCase()
  if (email !== SUPER_ADMIN.toLowerCase()) redirect('/admin/login')
  return email
}

async function saveAuditedConfig({
  actorEmail,
  section,
  summary,
  beforeConfig,
  afterConfig,
}: {
  actorEmail: string
  section: string
  summary: string
  beforeConfig: SiteConfig
  afterConfig: SiteConfig
}) {
  await saveConfig(afterConfig)
  revalidatePath('/', 'layout')

  const fallbackEditedAt = new Date().toISOString()
  let editedAt = fallbackEditedAt

  try {
    const auditLog = await recordSiteEdit({
      actorEmail,
      section,
      summary,
      beforeConfig,
      afterConfig,
    })
    editedAt = auditLog?.createdAt ?? fallbackEditedAt
  } catch (error) {
    console.error('Failed to record site edit audit log', error)
  }

  try {
    await sendSiteEditReportEmail({
      actorEmail,
      section,
      summary,
      editedAt,
      afterConfig,
    })
  } catch (error) {
    console.error('Failed to send site edit report email', error)
  }
}

export async function logout() {
  await signOut({ redirectTo: '/admin/login' })
}

/* ── Site content ─────────────────────────────────────────── */
export async function saveSiteTitle(siteTitle: string) {
  const actorEmail = await requireAuth()
  const config = await getConfig()
  await saveAuditedConfig({
    actorEmail,
    section: 'Site title',
    summary: `Updated site title from "${config.siteTitle}" to "${siteTitle}".`,
    beforeConfig: config,
    afterConfig: { ...config, siteTitle },
  })
}

export async function saveHero(hero: SiteConfig['hero']) {
  const actorEmail = await requireAuth()
  const config = await getConfig()
  await saveAuditedConfig({
    actorEmail,
    section: 'Hero',
    summary: 'Updated hero headline and supporting copy.',
    beforeConfig: config,
    afterConfig: { ...config, hero },
  })
}

export async function savePharmacist(pharmacist: SiteConfig['pharmacist']) {
  const actorEmail = await requireAuth()
  const config = await getConfig()
  await saveAuditedConfig({
    actorEmail,
    section: 'Pharmacist profile',
    summary: 'Updated pharmacist profile details.',
    beforeConfig: config,
    afterConfig: { ...config, pharmacist },
  })
}

export async function saveServices(services: SiteConfig['services']) {
  const actorEmail = await requireAuth()
  const config = await getConfig()
  await saveAuditedConfig({
    actorEmail,
    section: 'Services',
    summary: `Updated services content with ${services.items.length} service item${services.items.length === 1 ? '' : 's'}.`,
    beforeConfig: config,
    afterConfig: { ...config, services },
  })
}

export async function saveTrust(trust: SiteConfig['trust']) {
  const actorEmail = await requireAuth()
  const config = await getConfig()
  await saveAuditedConfig({
    actorEmail,
    section: 'Why Kardinal',
    summary: `Updated trust content with ${trust.items.length} reason${trust.items.length === 1 ? '' : 's'}.`,
    beforeConfig: config,
    afterConfig: { ...config, trust },
  })
}

export async function saveCosmeticLine(cosmeticLine: SiteConfig['cosmeticLine']) {
  const actorEmail = await requireAuth()
  const config = await getConfig()
  await saveAuditedConfig({
    actorEmail,
    section: 'Cosmetic line',
    summary: `Updated cosmetic line with ${cosmeticLine.items.length} product${cosmeticLine.items.length === 1 ? '' : 's'}.`,
    beforeConfig: config,
    afterConfig: { ...config, cosmeticLine },
  })
}

export async function uploadAvatar(formData: FormData) {
  const actorEmail = await requireAuth()
  const file = formData.get('avatar') as File
  if (!file || file.size === 0) return

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg'
  const filename = `pharmacist-avatar.${safeExt}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')

  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))

  const config = await getConfig()
  await saveAuditedConfig({
    actorEmail,
    section: 'Pharmacist photo',
    summary: 'Updated pharmacist profile photo.',
    beforeConfig: config,
    afterConfig: {
      ...config,
      pharmacist: { ...config.pharmacist, avatarUrl: `/uploads/${filename}` },
    },
  })
}

/* ── User management (super admin only) ──────────────────── */
export async function addAdmin(email: string) {
  await requireSuperAdmin()
  const trimmed = email.trim().toLowerCase()
  if (!trimmed || !trimmed.includes('@')) {
    return { added: false, emailSent: false, error: 'Enter a valid email address.' }
  }
  const { emails } = await getAdmins()
  if (emails.some((e) => e.toLowerCase() === trimmed)) {
    return { added: false, emailSent: false, error: 'This admin already exists.' }
  }
  await saveAdmins({ emails: [...emails, trimmed] })

  try {
    await sendNewAdminEmail(trimmed)
    return { added: true, emailSent: true }
  } catch (error) {
    console.error('Failed to send new admin email', error)
    return {
      added: true,
      emailSent: false,
      error: 'Admin added, but the notification email could not be sent.',
    }
  }
}

export async function removeAdmin(email: string) {
  await requireSuperAdmin()
  const target = email.trim().toLowerCase()
  if (target === SUPER_ADMIN.toLowerCase()) return
  const { emails } = await getAdmins()
  await saveAdmins({ emails: emails.filter((e) => e.toLowerCase() !== target) })
}

export async function uploadProductImage(formData: FormData): Promise<string> {
  await requireAuth()
  const file = formData.get('image') as File
  if (!file || file.size === 0) return ''

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg'
  const filename = `product-${Date.now()}.${safeExt}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')

  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))

  return `/uploads/products/${filename}`
}
