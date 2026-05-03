import fs from 'fs/promises'
import path from 'path'
import { cache } from 'react'
import { SUPER_ADMIN } from './constants'

export { SUPER_ADMIN }
const ADMINS_PATH = path.join(process.cwd(), 'data', 'admins.json')
const ADMINS_KEY = 'kardinal:admins'

type AdminsData = { emails: string[] }
type AdminsInput = AdminsData | string[] | null | undefined

function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return { url: url.replace(/\/$/, ''), token }
}

function normalizeAdmins(data: AdminsInput): AdminsData {
  const source = Array.isArray(data) ? data : data?.emails ?? []
  const emails = Array.from(
    new Set([
      SUPER_ADMIN.toLowerCase(),
      ...source
        .filter((email): email is string => typeof email === 'string')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ]),
  )
  return { emails }
}

async function readAdminsFromFile(): Promise<AdminsData> {
  try {
    const raw = await fs.readFile(ADMINS_PATH, 'utf-8')
    return normalizeAdmins(JSON.parse(raw) as AdminsInput)
  } catch {
    return { emails: [SUPER_ADMIN] }
  }
}

async function readAdminsFromKv(): Promise<AdminsData | null> {
  const kv = getKvConfig()
  if (!kv) return null

  const response = await fetch(`${kv.url}/get/${encodeURIComponent(ADMINS_KEY)}`, {
    headers: { Authorization: `Bearer ${kv.token}` },
    cache: 'no-store',
  })

  if (!response.ok) throw new Error(`Failed to read admins from KV: ${response.status}`)

  const { result } = await response.json()
  if (!result) {
    const fileAdmins = await readAdminsFromFile()
    await saveAdminsToKv(fileAdmins)
    return fileAdmins
  }

  const parsed = typeof result === 'string' ? JSON.parse(result) : result
  return normalizeAdmins(parsed as AdminsInput)
}

async function saveAdminsToKv(data: AdminsData): Promise<boolean> {
  const kv = getKvConfig()
  if (!kv) return false

  const value = encodeURIComponent(JSON.stringify(normalizeAdmins(data)))
  const response = await fetch(`${kv.url}/set/${encodeURIComponent(ADMINS_KEY)}/${value}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kv.token}` },
  })

  if (!response.ok) throw new Error(`Failed to save admins to KV: ${response.status}`)
  return true
}

/** Plain read — safe to call outside a React render (e.g. in auth callbacks). */
export async function readAdmins(): Promise<AdminsData> {
  try {
    const kvAdmins = await readAdminsFromKv()
    if (kvAdmins) return kvAdmins
  } catch (error) {
    console.error('Failed to read admins from KV; falling back to local admin file', error)
  }

  return readAdminsFromFile()
}

/** Cached read for use inside server components / server actions. */
export const getAdmins = cache(readAdmins)

export async function saveAdmins(data: AdminsData): Promise<void> {
  if (await saveAdminsToKv(data)) return
  await fs.writeFile(ADMINS_PATH, JSON.stringify(normalizeAdmins(data), null, 2), 'utf-8')
}
