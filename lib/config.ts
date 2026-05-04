import fs from 'fs/promises'
import path from 'path'
import { cache } from 'react'
import type { SiteConfig } from './types'
import { getSql } from './db'

const CONFIG_PATH = path.join(process.cwd(), 'data', 'site-config.json')
const CONFIG_KEY = 'site'

async function readConfigFromFile(): Promise<SiteConfig> {
  const raw = await fs.readFile(CONFIG_PATH, 'utf-8')
  return JSON.parse(raw) as SiteConfig
}

async function ensureConfigTable(sql: NonNullable<ReturnType<typeof getSql>>) {
  await sql`
    create table if not exists site_config (
      key text primary key,
      value jsonb not null,
      updated_at timestamptz not null default now()
    )
  `
}

async function readConfigFromDb(): Promise<SiteConfig | null> {
  const sql = getSql()
  if (!sql) return null

  await ensureConfigTable(sql)
  const rows = await sql`
    select value
    from site_config
    where key = ${CONFIG_KEY}
    limit 1
  ` as { value: SiteConfig }[]

  if (rows.length === 0) {
    const fileConfig = await readConfigFromFile()
    await saveConfigToDb(fileConfig)
    return fileConfig
  }

  return rows[0].value
}

async function saveConfigToDb(config: SiteConfig): Promise<boolean> {
  const sql = getSql()
  if (!sql) return false

  await ensureConfigTable(sql)
  await sql`
    insert into site_config (key, value, updated_at)
    values (${CONFIG_KEY}, ${JSON.stringify(config)}::jsonb, now())
    on conflict (key) do update
      set value = excluded.value,
          updated_at = now()
  `
  return true
}

export const getConfig = cache(async (): Promise<SiteConfig> => {
  try {
    const dbConfig = await readConfigFromDb()
    if (dbConfig) return dbConfig
  } catch (error) {
    console.error('Failed to read site config from Neon; falling back to local config file', error)
  }

  return readConfigFromFile()
})

export async function saveConfig(config: SiteConfig): Promise<void> {
  if (await saveConfigToDb(config)) return
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}
