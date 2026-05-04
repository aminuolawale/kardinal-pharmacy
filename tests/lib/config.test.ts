import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SiteConfig } from '@/lib/types'

const { getSqlMock } = vi.hoisted(() => ({
  getSqlMock: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  getSql: getSqlMock,
}))

const ORIGINAL_CWD = process.cwd()
let tempDir: string

const config: SiteConfig = {
  siteTitle: 'Kardinal Pharmacy',
  hero: { headlinePrimary: 'Primary', headlineEmphasis: 'Emphasis', subtitle: 'Subtitle' },
  pharmacist: {
    name: 'Pharm. Test',
    description: 'Pharmacist',
    credentials: [],
    profileDescription: 'Profile',
    avatarUrl: '',
  },
  services: { headline: 'Services', subtitle: 'Service sub', items: [] },
  trust: { items: [] },
  cosmeticLine: { headline: 'Cosmetics', subtitle: 'Cosmetic sub', items: [] },
}

beforeEach(async () => {
  vi.resetModules()
  getSqlMock.mockReturnValue(null)
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kardinal-config-'))
  await fs.mkdir(path.join(tempDir, 'data'))
  await fs.writeFile(path.join(tempDir, 'data', 'site-config.json'), JSON.stringify(config))
  process.chdir(tempDir)
})

afterEach(async () => {
  process.chdir(ORIGINAL_CWD)
  await fs.rm(tempDir, { recursive: true, force: true })
  getSqlMock.mockReset()
  vi.resetModules()
})

describe('site config storage', () => {
  it('reads and writes JSON locally when Neon is not configured', async () => {
    const { getConfig, saveConfig } = await import('@/lib/config')

    await expect(getConfig()).resolves.toEqual(config)
    await saveConfig({ ...config, siteTitle: 'Updated' })

    const raw = await fs.readFile(path.join(tempDir, 'data', 'site-config.json'), 'utf-8')
    expect(JSON.parse(raw).siteTitle).toBe('Updated')
  })

  it('reads config from Neon when present', async () => {
    const sqlMock = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ value: { ...config, siteTitle: 'From DB' } }])
    getSqlMock.mockReturnValue(sqlMock)
    const { getConfig } = await import('@/lib/config')

    await expect(getConfig()).resolves.toMatchObject({ siteTitle: 'From DB' })
  })

  it('bootstraps empty Neon config from the local file', async () => {
    const sqlMock = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([])
      .mockResolvedValue(undefined)
    getSqlMock.mockReturnValue(sqlMock)
    const { getConfig } = await import('@/lib/config')

    await expect(getConfig()).resolves.toEqual(config)
    expect(sqlMock).toHaveBeenCalledTimes(4)
  })
})

