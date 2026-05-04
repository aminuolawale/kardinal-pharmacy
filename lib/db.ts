import { neon } from '@neondatabase/serverless'

type SqlClient = ReturnType<typeof neon>

let sqlClient: SqlClient | null | undefined

export function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.NEON_DATABASE_URL ||
    ''
  ).trim()
}

export function getSql() {
  if (sqlClient !== undefined) return sqlClient

  const databaseUrl = getDatabaseUrl()
  sqlClient = databaseUrl ? neon(databaseUrl) : null
  return sqlClient
}

