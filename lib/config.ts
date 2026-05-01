import fs from 'fs/promises'
import path from 'path'
import { cache } from 'react'
import type { SiteConfig } from './types'

const CONFIG_PATH = path.join(process.cwd(), 'data', 'site-config.json')

export const getConfig = cache(async (): Promise<SiteConfig> => {
  const raw = await fs.readFile(CONFIG_PATH, 'utf-8')
  return JSON.parse(raw) as SiteConfig
})

export async function saveConfig(config: SiteConfig): Promise<void> {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}
