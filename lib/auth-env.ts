function firstEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }
}

export const authSecret = firstEnv(
  "AUTH_SECRET",
  "NEXTAUTH_SECRET",
  "AUTH_GOOGLE_SECRET",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_SECRET",
)

export const googleClientId = firstEnv(
  "AUTH_GOOGLE_ID",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_ID",
)

export const googleClientSecret = firstEnv(
  "AUTH_GOOGLE_SECRET",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_SECRET",
)
