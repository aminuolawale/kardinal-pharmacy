import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getSqlMock } = vi.hoisted(() => ({
  getSqlMock: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  getSql: getSqlMock,
}))

const ORIGINAL_CWD = process.cwd()
let tempDir: string

beforeEach(async () => {
  vi.resetModules()
  getSqlMock.mockReturnValue(null)
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kardinal-admins-'))
  await fs.mkdir(path.join(tempDir, 'data'))
  process.chdir(tempDir)
})

afterEach(async () => {
  process.chdir(ORIGINAL_CWD)
  await fs.rm(tempDir, { recursive: true, force: true })
  getSqlMock.mockReset()
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

  it('reads admins from Neon when a database is configured', async () => {
    const sqlMock = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ email: 'db@example.com' }])
    getSqlMock.mockReturnValue(sqlMock)
    const { readAdmins, saveAdmins } = await import('@/lib/admins')

    await expect(readAdmins()).resolves.toEqual({
      emails: ['aminumohammed@kardinalpharmacy.com', 'db@example.com'],
    })
    expect(sqlMock).toHaveBeenCalledTimes(2)

    sqlMock.mockClear()
    await saveAdmins({ emails: ['saved@example.com'] })

    expect(sqlMock).toHaveBeenCalledTimes(4)
  })

  it('bootstraps empty Neon storage from the local admin file', async () => {
    await fs.writeFile(
      path.join(tempDir, 'data', 'admins.json'),
      JSON.stringify({ emails: ['file@example.com'] }),
    )
    const sqlMock = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([])
      .mockResolvedValue(undefined)
    getSqlMock.mockReturnValue(sqlMock)
    const { readAdmins } = await import('@/lib/admins')

    await expect(readAdmins()).resolves.toEqual({
      emails: ['aminumohammed@kardinalpharmacy.com', 'file@example.com'],
    })
    expect(sqlMock).toHaveBeenCalledTimes(6)
  })

  it('falls back to the local admin file if Neon is unreachable', async () => {
    await fs.writeFile(
      path.join(tempDir, 'data', 'admins.json'),
      JSON.stringify({ emails: ['file@example.com'] }),
    )
    getSqlMock.mockReturnValue(vi.fn().mockRejectedValue(new Error('db down')))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { readAdmins } = await import('@/lib/admins')

    await expect(readAdmins()).resolves.toEqual({
      emails: ['aminumohammed@kardinalpharmacy.com', 'file@example.com'],
    })
  })
})
