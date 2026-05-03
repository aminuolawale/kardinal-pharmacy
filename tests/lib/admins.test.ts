import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ORIGINAL_CWD = process.cwd()
let tempDir: string

beforeEach(async () => {
  vi.resetModules()
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kardinal-admins-'))
  await fs.mkdir(path.join(tempDir, 'data'))
  process.chdir(tempDir)
})

afterEach(async () => {
  process.chdir(ORIGINAL_CWD)
  await fs.rm(tempDir, { recursive: true, force: true })
  delete process.env.KV_REST_API_URL
  delete process.env.KV_REST_API_TOKEN
  delete process.env.UPSTASH_REDIS_REST_URL
  delete process.env.UPSTASH_REDIS_REST_TOKEN
  vi.resetModules()
})

describe('admin storage', () => {
  it('reads admins from data/admins.json', async () => {
    await fs.writeFile(
      path.join(tempDir, 'data', 'admins.json'),
      JSON.stringify({ emails: ['first@example.com', 'second@example.com'] }),
    )

    const { readAdmins } = await import('@/lib/admins')

    await expect(readAdmins()).resolves.toEqual({
      emails: ['aminumohammed@kardinalpharmacy.com', 'first@example.com', 'second@example.com'],
    })
  })

  it('falls back to the super admin when the file is missing or unreadable', async () => {
    const { readAdmins, SUPER_ADMIN } = await import('@/lib/admins')

    await expect(readAdmins()).resolves.toEqual({ emails: [SUPER_ADMIN] })
  })

  it('persists admin changes as formatted JSON', async () => {
    const { saveAdmins } = await import('@/lib/admins')

    await saveAdmins({ emails: ['admin@example.com'] })

    const raw = await fs.readFile(path.join(tempDir, 'data', 'admins.json'), 'utf-8')
    expect(raw).toBe(JSON.stringify({
      emails: ['aminumohammed@kardinalpharmacy.com', 'admin@example.com'],
    }, null, 2))
  })

  it('reads and writes admins through Vercel KV when configured', async () => {
    process.env.KV_REST_API_URL = 'https://kv.example.com'
    process.env.KV_REST_API_TOKEN = 'kv-token'
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: JSON.stringify({ emails: ['kv@example.com'] }) }),
      })
      .mockResolvedValueOnce({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    const { readAdmins, saveAdmins } = await import('@/lib/admins')

    await expect(readAdmins()).resolves.toEqual({
      emails: ['aminumohammed@kardinalpharmacy.com', 'kv@example.com'],
    })
    await saveAdmins({ emails: ['saved@example.com'] })

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://kv.example.com/get/kardinal%3Aadmins',
      expect.objectContaining({
        headers: { Authorization: 'Bearer kv-token' },
        cache: 'no-store',
      }),
    )
    expect(fetchMock.mock.calls[1][0]).toContain('https://kv.example.com/set/kardinal%3Aadmins/')
  })
})
