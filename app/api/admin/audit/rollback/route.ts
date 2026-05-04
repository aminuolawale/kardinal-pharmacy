import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getSiteAuditLog, getSiteAuditLogs, recordSiteEdit } from '@/lib/audit'
import { SUPER_ADMIN } from '@/lib/admins'
import { getConfig, saveConfig } from '@/lib/config'
import { sendSiteEditReportEmail } from '@/lib/mail'

export const runtime = 'nodejs'

async function getSuperAdminEmail() {
  const session = await auth()
  const email = session?.user?.email?.toLowerCase()
  return email === SUPER_ADMIN.toLowerCase() ? email : null
}

export async function POST(request: Request) {
  const actorEmail = await getSuperAdminEmail()
  if (!actorEmail) {
    return NextResponse.json({ restored: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const id = typeof body.id === 'string' ? body.id : ''
  const snapshot = body.snapshot === 'before' ? 'before' : 'after'
  if (!id) {
    return NextResponse.json({ restored: false, error: 'Missing audit log id.' }, { status: 400 })
  }

  const auditLog = await getSiteAuditLog(id)
  if (!auditLog) {
    return NextResponse.json({ restored: false, error: 'Audit log was not found.' }, { status: 404 })
  }

  if (snapshot === 'after') {
    const [latestLog] = await getSiteAuditLogs(1)
    if (latestLog?.id === auditLog.id) {
      return NextResponse.json(
        { restored: false, error: 'This revision is already the current saved version.' },
        { status: 409 },
      )
    }
  }

  const beforeConfig = await getConfig()
  const restoredConfig = snapshot === 'before' ? auditLog.beforeConfig : auditLog.afterConfig
  await saveConfig(restoredConfig)
  revalidatePath('/', 'layout')

  const summary = `Restored site to the ${snapshot} snapshot from ${new Date(auditLog.createdAt).toLocaleString('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  })} after "${auditLog.section}" was edited.`

  let editedAt = new Date().toISOString()
  try {
    const rollbackLog = await recordSiteEdit({
      actorEmail,
      section: 'Rollback',
      summary,
      beforeConfig,
      afterConfig: restoredConfig,
    })
    editedAt = rollbackLog?.createdAt ?? editedAt
  } catch (error) {
    console.error('Failed to record rollback audit log', error)
  }

  try {
    await sendSiteEditReportEmail({
      actorEmail,
      section: 'Rollback',
      summary,
      editedAt,
      afterConfig: restoredConfig,
    })
  } catch (error) {
    console.error('Failed to send rollback report email', error)
  }

  return NextResponse.json({ restored: true })
}
