import { getSql } from './db'
import type { SiteAuditLog, SiteConfig } from './types'

type AuditRow = {
  id: string
  actor_email: string
  section: string
  summary: string
  created_at: Date | string
  before_config: SiteConfig
  after_config: SiteConfig
}

type RecordSiteEditInput = {
  actorEmail: string
  section: string
  summary: string
  beforeConfig: SiteConfig
  afterConfig: SiteConfig
}

async function ensureAuditTable(sql: NonNullable<ReturnType<typeof getSql>>) {
  await sql`
    create table if not exists site_audit_logs (
      id text primary key,
      actor_email text not null,
      section text not null,
      summary text not null,
      before_config jsonb not null,
      after_config jsonb not null,
      created_at timestamptz not null default now()
    )
  `
}

function mapAuditRow(row: AuditRow): SiteAuditLog {
  return {
    id: row.id,
    actorEmail: row.actor_email,
    section: row.section,
    summary: row.summary,
    createdAt: new Date(row.created_at).toISOString(),
    beforeConfig: row.before_config,
    afterConfig: row.after_config,
  }
}

export async function recordSiteEdit(input: RecordSiteEditInput): Promise<SiteAuditLog | null> {
  const sql = getSql()
  if (!sql) return null

  await ensureAuditTable(sql)
  const id = crypto.randomUUID()
  const rows = await sql`
    insert into site_audit_logs (
      id,
      actor_email,
      section,
      summary,
      before_config,
      after_config
    )
    values (
      ${id},
      ${input.actorEmail},
      ${input.section},
      ${input.summary},
      ${JSON.stringify(input.beforeConfig)}::jsonb,
      ${JSON.stringify(input.afterConfig)}::jsonb
    )
    returning id, actor_email, section, summary, created_at, before_config, after_config
  ` as AuditRow[]

  return rows[0] ? mapAuditRow(rows[0]) : null
}

export async function getSiteAuditLogs(limit = 30): Promise<SiteAuditLog[]> {
  const sql = getSql()
  if (!sql) return []

  await ensureAuditTable(sql)
  const rows = await sql`
    select id, actor_email, section, summary, created_at, before_config, after_config
    from site_audit_logs
    order by created_at desc
    limit ${limit}
  ` as AuditRow[]

  return rows.map(mapAuditRow)
}

export async function getSiteAuditLog(id: string): Promise<SiteAuditLog | null> {
  const sql = getSql()
  if (!sql) return null

  await ensureAuditTable(sql)
  const rows = await sql`
    select id, actor_email, section, summary, created_at, before_config, after_config
    from site_audit_logs
    where id = ${id}
    limit 1
  ` as AuditRow[]

  return rows[0] ? mapAuditRow(rows[0]) : null
}

