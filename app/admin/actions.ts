'use server'
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
