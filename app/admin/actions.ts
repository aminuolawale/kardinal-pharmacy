'use server'
import fs from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getConfig, saveConfig } from '@/lib/config'
import type { SiteConfig } from '@/lib/types'

async function requireAuth() {
  const session = await auth()
  if (!session) redirect('/admin/login')
}

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
