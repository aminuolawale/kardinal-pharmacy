import { afterEach, describe, expect, it, vi } from 'vitest'

const ORIGINAL_ENV = process.env

async function loadAuthEnv(env: NodeJS.ProcessEnv) {
  vi.resetModules()
  process.env = { ...ORIGINAL_ENV, ...env }
  return import('@/lib/auth-env')
}

afterEach(() => {
  process.env = ORIGINAL_ENV
  vi.resetModules()
})

describe('auth env resolution', () => {
  it('prefers explicit Auth.js secret names', async () => {
    const { authSecret } = await loadAuthEnv({
      AUTH_SECRET: ' auth-secret ',
      NEXTAUTH_SECRET: 'nextauth-secret',
      AUTH_GOOGLE_SECRET: 'google-secret',
    })

    expect(authSecret).toBe('auth-secret')
  })

  it('falls back to the Google OAuth secret when no auth secret is configured', async () => {
    const { authSecret } = await loadAuthEnv({
      AUTH_SECRET: '',
      NEXTAUTH_SECRET: '',
      AUTH_GOOGLE_SECRET: 'google-secret',
    })

    expect(authSecret).toBe('google-secret')
  })

  it('supports Auth.js and legacy Google OAuth env names', async () => {
    const { googleClientId, googleClientSecret } = await loadAuthEnv({
      AUTH_GOOGLE_ID: '',
      AUTH_GOOGLE_SECRET: '',
      GOOGLE_CLIENT_ID: 'legacy-client-id',
      GOOGLE_CLIENT_SECRET: 'legacy-client-secret',
    })

    expect(googleClientId).toBe('legacy-client-id')
    expect(googleClientSecret).toBe('legacy-client-secret')
  })
})

