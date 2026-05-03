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
      emails: ['first@example.com', 'second@example.com'],
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
    expect(raw).toBe(JSON.stringify({ emails: ['admin@example.com'] }, null, 2))
  })
})

