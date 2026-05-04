import fs from 'fs/promises'
import path from 'path'
import { cache } from 'react'
import { SUPER_ADMIN } from './constants'
import { getSql } from './db'

export { SUPER_ADMIN }
const ADMINS_PATH = path.join(process.cwd(), 'data', 'admins.json')

type AdminsData = { emails: string[] }
type AdminsInput = AdminsData | string[] | null | undefined

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

async function ensureAdminsTable(sql: NonNullable<ReturnType<typeof getSql>>) {
  await sql`
    create table if not exists admin_users (
      email text primary key,
      created_at timestamptz not null default now()
    )
  `
}

async function readAdminsFromDb(): Promise<AdminsData | null> {
  const sql = getSql()
  if (!sql) return null

  await ensureAdminsTable(sql)
  const rows = await sql`
    select email
    from admin_users
    order by created_at asc, email asc
  ` as { email: string }[]

  if (rows.length === 0) {
    const fileAdmins = await readAdminsFromFile()
    await saveAdminsToDb(fileAdmins)
    return fileAdmins
  }

  return normalizeAdmins({ emails: rows.map((row) => row.email) })
}

async function saveAdminsToDb(data: AdminsData): Promise<boolean> {
  const sql = getSql()
  if (!sql) return false

  const { emails } = normalizeAdmins(data)
  await ensureAdminsTable(sql)
  await sql`delete from admin_users`

  for (const email of emails) {
    await sql`
      insert into admin_users (email)
      values (${email})
      on conflict (email) do nothing
    `
  }
  return true
}

/** Plain read — safe to call outside a React render (e.g. in auth callbacks). */
export async function readAdmins(): Promise<AdminsData> {
  try {
    const dbAdmins = await readAdminsFromDb()
    if (dbAdmins) return dbAdmins
  } catch (error) {
    console.error('Failed to read admins from Neon; falling back to local admin file', error)
  }

  return readAdminsFromFile()
}

/** Cached read for use inside server components / server actions. */
export const getAdmins = cache(readAdmins)

export async function saveAdmins(data: AdminsData): Promise<void> {
  if (await saveAdminsToDb(data)) return
  await fs.writeFile(ADMINS_PATH, JSON.stringify(normalizeAdmins(data), null, 2), 'utf-8')
}
