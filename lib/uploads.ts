import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { getSql } from './db'

const MAX_BYTES = 5 * 1024 * 1024

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const TYPE_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

type Sql = NonNullable<ReturnType<typeof getSql>>

async function ensureImagesTable(sql: Sql) {
  await sql`
    create table if not exists uploaded_images (
      id text primary key,
      content_type text not null,
      data bytea not null,
      created_at timestamptz not null default now()
    )
  `
}

function resolveContentType(file: File): string {
  if (file.type && EXT_BY_TYPE[file.type]) return file.type
  const ext = (file.name.split('.').pop() ?? '').toLowerCase()
  const fromExt = TYPE_BY_EXT[ext]
  if (!fromExt) throw new Error('Unsupported image type. Use JPG, PNG, WebP or GIF.')
  return fromExt
}

/**
 * Persists an uploaded image and returns a public URL for it.
 * Uses Neon when a database is configured (required on serverless hosts,
 * whose filesystem is read-only); falls back to public/uploads for local dev.
 */
export async function storeImage(file: File, prefix: string): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error('Image is too large (max 5 MB).')

  const contentType = resolveContentType(file)
  const buffer = Buffer.from(await file.arrayBuffer())
  const id = `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}`

  const sql = getSql()
  if (sql) {
    await ensureImagesTable(sql)
    await sql`
      insert into uploaded_images (id, content_type, data)
      values (${id}, ${contentType}, decode(${buffer.toString('base64')}, 'base64'))
    `
    return `/api/images/${id}`
  }

  const filename = `${id}.${EXT_BY_TYPE[contentType]}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(path.join(uploadDir, filename), buffer)
  return `/uploads/${filename}`
}

export async function readImage(id: string): Promise<{ contentType: string; data: Buffer } | null> {
  const sql = getSql()
  if (!sql) return null

  await ensureImagesTable(sql)
  const rows = await sql`
    select content_type, encode(data, 'base64') as data
    from uploaded_images
    where id = ${id}
    limit 1
  ` as { content_type: string; data: string }[]

  if (rows.length === 0) return null
  return { contentType: rows[0].content_type, data: Buffer.from(rows[0].data, 'base64') }
}
