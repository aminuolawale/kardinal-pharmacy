import fs from 'fs/promises'
import path from 'path'
import { cache } from 'react'
import { SUPER_ADMIN } from './constants'

export { SUPER_ADMIN }
const ADMINS_PATH = path.join(process.cwd(), 'data', 'admins.json')

type AdminsData = { emails: string[] }

/** Plain read — safe to call outside a React render (e.g. in auth callbacks). */
export async function readAdmins(): Promise<AdminsData> {
  try {
    const raw = await fs.readFile(ADMINS_PATH, 'utf-8')
    return JSON.parse(raw) as AdminsData
  } catch {
    return { emails: [SUPER_ADMIN] }
  }
}

/** Cached read for use inside server components / server actions. */
export const getAdmins = cache(readAdmins)

export async function saveAdmins(data: AdminsData): Promise<void> {
  await fs.writeFile(ADMINS_PATH, JSON.stringify(data, null, 2), 'utf-8')
}
