'use client'
import { useState, useTransition } from 'react'
import type { SiteConfig, ListItem } from '@/lib/types'
import {
  saveSiteTitle,
  saveHero,
  savePharmacist,
  saveServices,
  saveTrust,
  saveCosmeticLine,
  uploadAvatar,
  addAdmin,
  removeAdmin,
} from './actions'
import { SUPER_ADMIN } from '@/lib/constants'

/* ── Section nav ──────────────────────────────────────────── */
type SectionId = 'site' | 'hero' | 'pharmacist' | 'services' | 'trust' | 'cosmetic' | 'users'
const BASE_SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'site',        label: 'Site' },
  { id: 'hero',        label: 'Hero' },
  { id: 'pharmacist',  label: 'Pharmacist' },
  { id: 'services',    label: 'Services' },
  { id: 'trust',       label: 'Why Kardinal' },
  { id: 'cosmetic',    label: 'Cosmetic Line' },
]

/* ── Shared styles ────────────────────────────────────────── */
const S = {
  card: {
    background: 'var(--white)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
  } as React.CSSProperties,
  cardHead: {
    background: 'var(--green-800)',
    color: 'var(--white)',
    padding: '12px 20px',
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,
  cardBody: { padding: '20px' } as React.CSSProperties,
  field: { marginBottom: 14 } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: 5,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font)',
    fontSize: '0.9rem',
    color: 'var(--text)',
    outline: 'none',
    background: 'var(--white)',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font)',
    fontSize: '0.9rem',
    color: 'var(--text)',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: 72,
    background: 'var(--white)',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  saveRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTop: '1px solid var(--border)',
  } as React.CSSProperties,
  saveBtn: {
    background: 'var(--green-800)',
    color: 'var(--white)',
    border: 'none',
    borderRadius: '50px',
    padding: '9px 22px',
    fontFamily: 'var(--font)',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  itemCard: {
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '14px',
    marginBottom: 10,
    background: 'var(--green-50)',
  } as React.CSSProperties,
  deleteBtn: {
    background: 'none',
    border: '1px solid #fca5a5',
    color: '#ef4444',
    borderRadius: 4,
    padding: '3px 9px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'var(--font)',
  } as React.CSSProperties,
  addBtn: {
    background: 'none',
    border: '1.5px dashed var(--green-200)',
    color: 'var(--green-700)',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 16px',
    fontFamily: 'var(--font)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center' as const,
    marginTop: 4,
  } as React.CSSProperties,
}

/* ── Primitives ───────────────────────────────────────────── */
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={S.card}>
      <div style={S.cardHead}>{title}</div>
      <div style={S.cardBody}>{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={S.field}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  )
}

function SaveRow({ isPending, saved, onSave }: { isPending: boolean; saved: boolean; onSave: () => void }) {
  return (
    <div style={S.saveRow}>
      {saved && <span style={{ color: 'var(--green-700)', fontSize: '0.82rem', fontWeight: 500 }}>Saved ✓</span>}
      <button onClick={onSave} disabled={isPending} style={{ ...S.saveBtn, opacity: isPending ? 0.6 : 1 }}>
        {isPending ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}

function ItemsList({ items, onAdd, onRemove, onUpdate, addLabel = 'Add Item' }: {
  items: ListItem[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, field: 'title' | 'description', value: string) => void
  addLabel?: string
}) {
  return (
    <>
      {items.map((item) => (
        <div key={item.id} style={S.itemCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ ...S.label, margin: 0 }}>Title</label>
            <button onClick={() => onRemove(item.id)} style={S.deleteBtn}>Remove</button>
          </div>
          <input
            value={item.title}
            onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
            style={{ ...S.input, marginBottom: 10 }}
          />
          <label style={S.label}>Description</label>
          <textarea
            value={item.description}
            onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
            style={S.textarea}
            rows={3}
          />
        </div>
      ))}
      <button onClick={onAdd} style={S.addBtn}>+ {addLabel}</button>
    </>
  )
}

function CredentialsList({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  return (
    <>
      {items.map((cred, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input
            value={cred}
            onChange={(e) => onChange(items.map((c, j) => (j === i ? e.target.value : c)))}
            style={{ ...S.input, flex: 1 }}
            placeholder="e.g. PCN Licensed"
          />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} style={S.deleteBtn}>✕</button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ''])} style={S.addBtn}>+ Add Credential</button>
    </>
  )
}

function AvatarUpload({ current, initials }: { current: string; initials: string }) {
  const [preview, setPreview] = useState<string | null>(current || null)
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
    const fd = new FormData()
    fd.append('avatar', file)
    startTransition(async () => {
      await uploadAvatar(fd)
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'var(--green-800)', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, color: 'var(--white)', fontSize: '1.2rem',
        flexShrink: 0, border: '3px solid var(--border)',
      }}>
        {preview
          ? <img src={preview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span>{initials}</span>
        }
      </div>
      <div>
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--green-50)', border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '8px 14px',
          fontSize: '0.85rem', cursor: isPending ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font)', color: 'var(--green-800)', fontWeight: 500,
        }}>
          {isPending ? 'Uploading…' : done ? 'Uploaded ✓' : '↑  Upload Photo'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} disabled={isPending} />
        </label>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
          JPG, PNG or WebP · replaces the initials on the live site
        </p>
      </div>
    </div>
  )
}

/* ── Section forms ────────────────────────────────────────── */
function SiteTitleSection({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    startTransition(async () => {
      await saveSiteTitle(value)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <SectionCard title="Site">
      <Field label="Site Title">
        <input value={value} onChange={(e) => setValue(e.target.value)} style={S.input} />
      </Field>
      <SaveRow isPending={isPending} saved={saved} onSave={handleSave} />
    </SectionCard>
  )
}

function HeroSection({ initial }: { initial: SiteConfig['hero'] }) {
  const [primary, setPrimary] = useState(initial.headlinePrimary)
  const [emphasis, setEmphasis] = useState(initial.headlineEmphasis)
  const [subtitle, setSubtitle] = useState(initial.subtitle)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    startTransition(async () => {
      await saveHero({ headlinePrimary: primary, headlineEmphasis: emphasis, subtitle })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <SectionCard title="Hero">
      <Field label="Headline — first line">
        <input value={primary} onChange={(e) => setPrimary(e.target.value)} style={S.input} />
      </Field>
      <Field label="Headline — emphasis (shown in gold)">
        <input value={emphasis} onChange={(e) => setEmphasis(e.target.value)} style={S.input} />
      </Field>
      <Field label="Subtitle">
        <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={S.textarea} rows={3} />
      </Field>
      <SaveRow isPending={isPending} saved={saved} onSave={handleSave} />
    </SectionCard>
  )
}

function PharmacistSection({ initial }: { initial: SiteConfig['pharmacist'] }) {
  const [name, setName] = useState(initial.name)
  const [description, setDescription] = useState(initial.description)
  const [credentials, setCredentials] = useState(initial.credentials)
  const [profileDescription, setProfileDescription] = useState(initial.profileDescription)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const initials = name
    .split(' ')
    .filter((w) => !w.endsWith('.'))
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

  const handleSave = () => {
    startTransition(async () => {
      await savePharmacist({ name, description, credentials, profileDescription, avatarUrl: initial.avatarUrl })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <SectionCard title="Pharmacist">
      <Field label="Photo">
        <AvatarUpload current={initial.avatarUrl} initials={initials} />
      </Field>
      <Field label="Full Name">
        <input value={name} onChange={(e) => setName(e.target.value)} style={S.input} />
      </Field>
      <Field label="Role / Description">
        <input value={description} onChange={(e) => setDescription(e.target.value)} style={S.input} />
      </Field>
      <Field label="Credentials (appear as badges on hero and checklist on about page)">
        <CredentialsList items={credentials} onChange={setCredentials} />
      </Field>
      <Field label="Profile description (blank line between paragraphs)">
        <textarea
          value={profileDescription}
          onChange={(e) => setProfileDescription(e.target.value)}
          style={{ ...S.textarea, minHeight: 180 }}
          rows={8}
        />
      </Field>
      <SaveRow isPending={isPending} saved={saved} onSave={handleSave} />
    </SectionCard>
  )
}

function ServicesSection({ initial }: { initial: SiteConfig['services'] }) {
  const [headline, setHeadline] = useState(initial.headline)
  const [subtitle, setSubtitle] = useState(initial.subtitle)
  const [items, setItems] = useState<ListItem[]>(initial.items)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const addItem = () => setItems((p) => [...p, { id: crypto.randomUUID(), title: '', description: '' }])
  const removeItem = (id: string) => setItems((p) => p.filter((it) => it.id !== id))
  const updateItem = (id: string, field: 'title' | 'description', value: string) =>
    setItems((p) => p.map((it) => (it.id === id ? { ...it, [field]: value } : it)))

  const handleSave = () => {
    startTransition(async () => {
      await saveServices({ headline, subtitle, items })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <SectionCard title={`Services · What We Offer${items.length > 3 ? '  (carousel active)' : ''}`}>
      <Field label="Headline">
        <input value={headline} onChange={(e) => setHeadline(e.target.value)} style={S.input} />
      </Field>
      <Field label="Subtitle">
        <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={S.textarea} rows={2} />
      </Field>
      <div style={S.field}>
        <label style={S.label}>Services ({items.length})</label>
        <ItemsList items={items} onAdd={addItem} onRemove={removeItem} onUpdate={updateItem} addLabel="Add Service" />
      </div>
      <SaveRow isPending={isPending} saved={saved} onSave={handleSave} />
    </SectionCard>
  )
}

function TrustSection({ initial }: { initial: SiteConfig['trust'] }) {
  const [items, setItems] = useState<ListItem[]>(initial.items)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const addItem = () => setItems((p) => [...p, { id: crypto.randomUUID(), title: '', description: '' }])
  const removeItem = (id: string) => setItems((p) => p.filter((it) => it.id !== id))
  const updateItem = (id: string, field: 'title' | 'description', value: string) =>
    setItems((p) => p.map((it) => (it.id === id ? { ...it, [field]: value } : it)))

  const handleSave = () => {
    startTransition(async () => {
      await saveTrust({ items })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <SectionCard title={`Why Kardinal (${items.length} reason${items.length !== 1 ? 's' : ''})`}>
      <div style={S.field}>
        <label style={S.label}>Reasons</label>
        <ItemsList items={items} onAdd={addItem} onRemove={removeItem} onUpdate={updateItem} addLabel="Add Reason" />
      </div>
      <SaveRow isPending={isPending} saved={saved} onSave={handleSave} />
    </SectionCard>
  )
}

function CosmeticSection({ initial }: { initial: SiteConfig['cosmeticLine'] }) {
  const [headline, setHeadline] = useState(initial.headline)
  const [subtitle, setSubtitle] = useState(initial.subtitle)
  const [items, setItems] = useState<ListItem[]>(initial.items)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const addItem = () => setItems((p) => [...p, { id: crypto.randomUUID(), title: '', description: '' }])
  const removeItem = (id: string) => setItems((p) => p.filter((it) => it.id !== id))
  const updateItem = (id: string, field: 'title' | 'description', value: string) =>
    setItems((p) => p.map((it) => (it.id === id ? { ...it, [field]: value } : it)))

  const handleSave = () => {
    startTransition(async () => {
      await saveCosmeticLine({ headline, subtitle, items })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <SectionCard title={`Our Cosmetic Line${items.length > 3 ? '  (carousel active)' : ''}`}>
      <Field label="Headline">
        <input value={headline} onChange={(e) => setHeadline(e.target.value)} style={S.input} />
      </Field>
      <Field label="Subtitle">
        <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={S.textarea} rows={2} />
      </Field>
      <div style={S.field}>
        <label style={S.label}>Products ({items.length})</label>
        <ItemsList items={items} onAdd={addItem} onRemove={removeItem} onUpdate={updateItem} addLabel="Add Product" />
      </div>
      <SaveRow isPending={isPending} saved={saved} onSave={handleSave} />
    </SectionCard>
  )
}

/* ── Users section (super admin only) ────────────────────── */
function UsersSection({ initialAdmins }: { initialAdmins: string[] }) {
  const [admins, setAdmins] = useState(initialAdmins)
  const [newEmail, setNewEmail] = useState('')
  const [addPending, startAdd] = useTransition()
  const [removePending, startRemove] = useTransition()
  const [addedMsg, setAddedMsg] = useState(false)

  const handleAdd = () => {
    if (!newEmail.trim()) return
    startAdd(async () => {
      await addAdmin(newEmail)
      setAdmins((prev) => prev.includes(newEmail.trim().toLowerCase())
        ? prev
        : [...prev, newEmail.trim().toLowerCase()])
      setNewEmail('')
      setAddedMsg(true)
      setTimeout(() => setAddedMsg(false), 2000)
    })
  }

  const handleRemove = (email: string) => {
    startRemove(async () => {
      await removeAdmin(email)
      setAdmins((prev) => prev.filter((e) => e !== email))
    })
  }

  return (
    <SectionCard title="User Management">
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 20 }}>
        These Google accounts can sign in and edit the site. The super admin cannot be removed.
      </p>

      <div style={{ marginBottom: 20 }}>
        {admins.map((email) => {
          const isSuper = email === SUPER_ADMIN
          return (
            <div
              key={email}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 8,
                background: isSuper ? 'var(--green-50)' : 'var(--white)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: isSuper ? 'var(--green-800)' : 'var(--green-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700,
                  color: isSuper ? 'var(--white)' : 'var(--green-800)',
                  flexShrink: 0,
                }}>
                  {email[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email}
                </span>
              </div>
              {isSuper ? (
                <span style={{
                  fontSize: '0.72rem', fontWeight: 600,
                  color: 'var(--green-800)', background: 'var(--green-100)',
                  padding: '3px 8px', borderRadius: '50px',
                  flexShrink: 0,
                }}>
                  Super Admin
                </span>
              ) : (
                <button
                  onClick={() => handleRemove(email)}
                  disabled={removePending}
                  style={{ ...S.deleteBtn, flexShrink: 0 }}
                >
                  Remove
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <label style={S.label}>Add admin by email</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="name@gmail.com"
            style={{ ...S.input, flex: 1 }}
          />
          <button
            onClick={handleAdd}
            disabled={addPending || !newEmail.trim()}
            style={{
              ...S.saveBtn,
              borderRadius: 'var(--radius-sm)',
              opacity: addPending || !newEmail.trim() ? 0.5 : 1,
              flexShrink: 0,
            }}
          >
            {addPending ? 'Adding…' : addedMsg ? 'Added ✓' : 'Add'}
          </button>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
          The user must sign in with this exact Google account email.
        </p>
      </div>
    </SectionCard>
  )
}

/* ── Root ─────────────────────────────────────────────────── */
export default function AdminForms({
  config,
  userEmail,
  admins,
}: {
  config: SiteConfig
  userEmail: string
  admins: string[]
}) {
  const isSuperAdmin = userEmail === SUPER_ADMIN
  const sections = isSuperAdmin
    ? [...BASE_SECTIONS, { id: 'users' as SectionId, label: 'Users' }]
    : BASE_SECTIONS

  const [active, setActive] = useState<SectionId>('site')

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 210,
        borderRight: '1px solid var(--border)',
        padding: '20px 10px',
        position: 'sticky',
        top: 64,
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
        flexShrink: 0,
        background: 'var(--white)',
      }}>
        <p style={{
          fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '0 10px', marginBottom: 10,
        }}>
          Sections
        </p>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '9px 12px', borderRadius: 'var(--radius-sm)',
              border: 'none', fontFamily: 'var(--font)',
              fontSize: '0.875rem',
              fontWeight: active === s.id ? 600 : 400,
              background: active === s.id ? 'var(--green-800)' : 'transparent',
              color: active === s.id ? 'var(--white)' : 'var(--text)',
              cursor: 'pointer', marginBottom: 2,
            }}
          >
            {s.label}
          </button>
        ))}

        {isSuperAdmin && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '12px 10px' }} />
            <p style={{
              fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '0 10px', marginBottom: 10,
            }}>
              Admin
            </p>
            <button
              onClick={() => setActive('users')}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                border: 'none', fontFamily: 'var(--font)',
                fontSize: '0.875rem',
                fontWeight: active === 'users' ? 600 : 400,
                background: active === 'users' ? 'var(--green-800)' : 'transparent',
                color: active === 'users' ? 'var(--white)' : 'var(--text)',
                cursor: 'pointer', marginBottom: 2,
              }}
            >
              Users
            </button>
          </>
        )}
      </aside>

      {/* Content pane */}
      <div style={{ flex: 1, padding: '28px 32px 64px', minWidth: 0 }}>
        {active === 'site'       && <SiteTitleSection  initial={config.siteTitle}    />}
        {active === 'hero'       && <HeroSection        initial={config.hero}         />}
        {active === 'pharmacist' && <PharmacistSection  initial={config.pharmacist}   />}
        {active === 'services'   && <ServicesSection    initial={config.services}     />}
        {active === 'trust'      && <TrustSection       initial={config.trust}        />}
        {active === 'cosmetic'   && <CosmeticSection    initial={config.cosmeticLine} />}
        {active === 'users' && isSuperAdmin && <UsersSection initialAdmins={admins} />}
      </div>
    </div>
  )
}
