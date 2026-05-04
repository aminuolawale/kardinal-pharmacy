import { afterEach, describe, expect, it, vi } from 'vitest'

const { neonMock } = vi.hoisted(() => ({
  neonMock: vi.fn(),
}))

vi.mock('@neondatabase/serverless', () => ({
  neon: neonMock,
}))

const ORIGINAL_ENV = process.env

async function loadDb(env: NodeJS.ProcessEnv, sqlClient?: unknown) {
  vi.resetModules()
  neonMock.mockReset()
  if (sqlClient) neonMock.mockReturnValue(sqlClient)
  process.env = { ...ORIGINAL_ENV, ...env }
  return import('@/lib/db')
}

afterEach(() => {
  process.env = ORIGINAL_ENV
  vi.resetModules()
  neonMock.mockReset()
})

describe('database helper', () => {
  it('returns an empty database URL when no supported env var is configured', async () => {
    const { getDatabaseUrl, getSql } = await loadDb({
      DATABASE_URL: '',
      POSTGRES_URL: '',
      POSTGRES_PRISMA_URL: '',
      NEON_DATABASE_URL: '',
    })

    expect(getDatabaseUrl()).toBe('')
    expect(getSql()).toBeNull()
    expect(neonMock).not.toHaveBeenCalled()
  })

  it('uses the first configured database URL and trims whitespace', async () => {
    const sqlClient = vi.fn()
    const { getDatabaseUrl, getSql } = await loadDb({
      DATABASE_URL: '  postgres://primary  ',
      POSTGRES_URL: 'postgres://fallback',
    }, sqlClient)

    expect(getDatabaseUrl()).toBe('postgres://primary')
    expect(getSql()).toBe(sqlClient)
    expect(neonMock).toHaveBeenCalledWith('postgres://primary')
  })

  it('memoizes the Neon client after the first lookup', async () => {
    const sqlClient = vi.fn()
    const { getSql } = await loadDb({ NEON_DATABASE_URL: 'postgres://neon' }, sqlClient)

    expect(getSql()).toBe(sqlClient)
    expect(getSql()).toBe(sqlClient)
    expect(neonMock).toHaveBeenCalledTimes(1)
  })
})
