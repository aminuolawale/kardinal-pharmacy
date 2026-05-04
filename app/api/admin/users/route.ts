import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getAdmins, saveAdmins, SUPER_ADMIN } from '@/lib/admins'
import { sendNewAdminEmail } from '@/lib/mail'

export const runtime = 'nodejs'

async function requireSuperAdmin() {
  try {
    const session = await auth()
    const email = session?.user?.email?.toLowerCase()
    return email === SUPER_ADMIN.toLowerCase()
  } catch (error) {
    console.error('Failed to verify admin session', error)
    return false
  }
}

export async function POST(request: Request) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const trimmed = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!trimmed || !trimmed.includes('@')) {
    return NextResponse.json(
      { added: false, emailSent: false, error: 'Enter a valid email address.' },
      { status: 400 },
    )
  }

  let emails: string[]
  try {
    ;({ emails } = await getAdmins())
  } catch (error) {
    console.error('Failed to read admins', error)
    return NextResponse.json(
      { added: false, emailSent: false, error: 'Admin list could not be loaded.' },
      { status: 500 },
    )
  }

  if (emails.some((email) => email.toLowerCase() === trimmed)) {
    return NextResponse.json(
      { added: false, emailSent: false, error: 'This admin already exists.' },
      { status: 409 },
    )
  }

  try {
    await saveAdmins({ emails: [...emails, trimmed] })
  } catch (error) {
    console.error('Failed to save admin', error)
    return NextResponse.json(
      { added: false, emailSent: false, error: 'Admin could not be saved.' },
      { status: 500 },
    )
  }

  try {
    await sendNewAdminEmail(trimmed)
    return NextResponse.json({ added: true, emailSent: true })
  } catch (error) {
    console.error('Failed to send new admin email', error)
    return NextResponse.json({
      added: true,
      emailSent: false,
      error: 'Admin added, but the notification email could not be sent.',
    })
  }
}

export async function DELETE(request: Request) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const target = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!target || target === SUPER_ADMIN.toLowerCase()) {
    return NextResponse.json({ removed: false })
  }

  try {
    const { emails } = await getAdmins()
    await saveAdmins({ emails: emails.filter((email) => email.toLowerCase() !== target) })
  } catch (error) {
    console.error('Failed to remove admin', error)
    return NextResponse.json({ removed: false, error: 'Admin could not be removed.' }, { status: 500 })
  }

  return NextResponse.json({ removed: true })
}
