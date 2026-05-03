'use server'
import fs from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { getConfig, saveConfig } from '@/lib/config'
import { getAdmins, saveAdmins, SUPER_ADMIN } from '@/lib/admins'
import { sendNewAdminEmail } from '@/lib/mail'
import type { SiteConfig } from '@/lib/types'

async function requireAuth() {
  const session = await auth()
  if (!session) redirect('/admin/login')
}

async function requireSuperAdmin() {
  const session = await auth()
  const email = session?.user?.email?.toLowerCase()
  if (email !== SUPER_ADMIN.toLowerCase()) redirect('/admin/login')
}

export async function logout() {
  await signOut({ redirectTo: '/admin/login' })
}

/* ── Site content ─────────────────────────────────────────── */
export async function saveSiteTitle(siteTitle: string) {
  await requireAuth()
  const config = await getConfig()
  await saveConfig({ ...config, siteTitle })
  revalidatePath('/', 'layout')
}

export async function saveHero(hero: SiteConfig['hero']) {
  await requireAuth()
  const config = await getConfig()
  await saveConfig({ ...config, hero })
  revalidatePath('/', 'layout')
}

export async function savePharmacist(pharmacist: SiteConfig['pharmacist']) {
  await requireAuth()
  const config = await getConfig()
  await saveConfig({ ...config, pharmacist })
  revalidatePath('/', 'layout')
}

export async function saveServices(services: SiteConfig['services']) {
  await requireAuth()
  const config = await getConfig()
  await saveConfig({ ...config, services })
  revalidatePath('/', 'layout')
}

export async function saveTrust(trust: SiteConfig['trust']) {
  await requireAuth()
  const config = await getConfig()
  await saveConfig({ ...config, trust })
  revalidatePath('/', 'layout')
}

export async function saveCosmeticLine(cosmeticLine: SiteConfig['cosmeticLine']) {
  await requireAuth()
  const config = await getConfig()
  await saveConfig({ ...config, cosmeticLine })
  revalidatePath('/', 'layout')
}

export async function uploadAvatar(formData: FormData) {
  await requireAuth()
  const file = formData.get('avatar') as File
  if (!file || file.size === 0) return

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg'
  const filename = `pharmacist-avatar.${safeExt}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')

  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))

  const config = await getConfig()
  await saveConfig({
    ...config,
    pharmacist: { ...config.pharmacist, avatarUrl: `/uploads/${filename}` },
  })
  revalidatePath('/', 'layout')
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
