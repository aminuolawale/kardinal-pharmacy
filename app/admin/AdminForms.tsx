'use client'
import { useState, useTransition } from 'react'
import type { SiteAuditLog, SiteConfig, ListItem, ProductItem } from '@/lib/types'
import {
  saveSiteTitle,
  saveHero,
  savePharmacist,
  saveServices,
  saveTrust,
  saveCosmeticLine,
  uploadAvatar,
  uploadProductImage,
} from './actions'
import { SUPER_ADMIN } from '@/lib/constants'

/* ── Section nav ──────────────────────────────────────────── */
type SectionId = 'site' | 'hero' | 'pharmacist' | 'services' | 'trust' | 'cosmetic' | 'users' | 'history'
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

function SaveRow({ isPending, saved, error, onSave }: { isPending: boolean; saved: boolean; error?: string | null; onSave: () => void }) {
  return (
    <div style={S.saveRow}>
      {saved && <span style={{ color: 'var(--green-700)', fontSize: '0.82rem', fontWeight: 500 }}>Saved ✓</span>}
      {error && <span style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 500 }}>{error}</span>}
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
          <div className="admin-item-head" style={{ marginBottom: 8 }}>
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
        <div key={i} className="admin-credential-row" style={{ gap: 8, marginBottom: 8 }}>
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
  const [error, setError] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
    const fd = new FormData()
    fd.append('avatar', file)
    startTransition(async () => {
      try {
        await uploadAvatar(fd)
        setDone(true)
        setTimeout(() => setDone(false), 2000)
      } catch (err) {
        setPreview(current || null)
        setError(err instanceof Error ? err.message : 'Upload failed — please try again')
      }
    })
  }

  return (
    <div className="admin-upload-row" style={{ gap: 20 }}>
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
          background: 'var(--green-50)', border: `1.5px solid ${error ? '#fca5a5' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)', padding: '8px 14px',
          fontSize: '0.85rem', cursor: isPending ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font)', color: error ? '#ef4444' : 'var(--green-800)', fontWeight: 500,
        }}>
          {isPending ? 'Uploading…' : done ? 'Uploaded ✓' : '↑  Upload Photo'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} disabled={isPending} />
        </label>
        {error
          ? <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 6 }}>{error}</p>
          : <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
              JPG, PNG or WebP · replaces the initials on the live site
            </p>
        }
      </div>
    </div>
  )
}

function ProductImageUpload({ current, onUploaded }: { current: string; onUploaded: (url: string) => void }) {
  const [preview, setPreview] = useState<string | null>(current || null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
    const fd = new FormData()
    fd.append('image', file)
    startTransition(async () => {
      try {
        const url = await uploadProductImage(fd)
        if (url) { setPreview(url); onUploaded(url) }
      } catch (err) {
        setPreview(current || null)
        setError(err instanceof Error ? err.message : 'Upload failed')
      }
    })
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <div className="admin-product-upload-row" style={{ gap: 14 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 8,
          background: 'var(--green-50)', border: `1.5px solid ${error ? '#fca5a5' : 'var(--border)'}`,
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: '0.75rem',
        }}>
          {preview
            ? <img src={preview} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span>No image</span>
          }
        </div>
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--green-50)', border: `1.5px solid ${error ? '#fca5a5' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)', padding: '7px 12px',
          fontSize: '0.82rem', cursor: isPending ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font)', color: error ? '#ef4444' : 'var(--green-800)', fontWeight: 500,
        }}>
          {isPending ? 'Uploading…' : '↑ Upload Image'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} disabled={isPending} />
        </label>
      </div>
      {error && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 5 }}>{error}</p>}
    </div>
  )
}

function ProductItemsList({ items, onAdd, onRemove, onUpdate }: {
  items: ProductItem[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, field: keyof Omit<ProductItem, 'id'>, value: string) => void
}) {
  return (
    <>
      {items.map((item) => (
        <div key={item.id} style={S.itemCard}>
          <div className="admin-item-head" style={{ marginBottom: 10 }}>
            <label style={{ ...S.label, margin: 0 }}>Product Image</label>
            <button onClick={() => onRemove(item.id)} style={S.deleteBtn}>Remove</button>
          </div>
          <ProductImageUpload
            current={item.imageUrl}
            onUploaded={(url) => onUpdate(item.id, 'imageUrl', url)}
          />
          <label style={S.label}>Title</label>
          <input
            value={item.title}
            onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
            style={{ ...S.input, marginBottom: 10 }}
          />
          <label style={S.label}>Price</label>
          <div className="admin-price-row" style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 10 }}>
            <span style={{ padding: '9px 10px', background: 'var(--green-50)', color: 'var(--green-800)', fontWeight: 700, borderRight: '1px solid var(--border)', fontSize: '0.9rem', flexShrink: 0 }}>₦</span>
            <input
              value={item.price}
              onChange={(e) => onUpdate(item.id, 'price', e.target.value)}
              style={{ ...S.input, border: 'none', borderRadius: 0, flex: 1 }}
              placeholder="Leave blank to hide"
            />
          </div>
          <label style={S.label}>Description</label>
          <textarea
            value={item.description}
            onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
            style={S.textarea}
            rows={3}
          />
        </div>
      ))}
      <button onClick={onAdd} style={S.addBtn}>+ Add Product</button>
    </>
  )
}

/* ── Section forms ────────────────────────────────────────── */
function SiteTitleSection({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      try {
        await saveSiteTitle(value)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch { setError('Save failed — please try again') }
    })
  }

  return (
    <SectionCard title="Site">
      <Field label="Site Title">
        <input value={value} onChange={(e) => setValue(e.target.value)} style={S.input} />
      </Field>
      <SaveRow isPending={isPending} saved={saved} error={error} onSave={handleSave} />
    </SectionCard>
  )
}

function HeroSection({ initial }: { initial: SiteConfig['hero'] }) {
  const [primary, setPrimary] = useState(initial.headlinePrimary)
  const [emphasis, setEmphasis] = useState(initial.headlineEmphasis)
  const [subtitle, setSubtitle] = useState(initial.subtitle)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      try {
        await saveHero({ headlinePrimary: primary, headlineEmphasis: emphasis, subtitle })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch { setError('Save failed — please try again') }
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
      <SaveRow isPending={isPending} saved={saved} error={error} onSave={handleSave} />
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
  const [error, setError] = useState<string | null>(null)

  const initials = name
    .split(' ')
    .filter((w) => !w.endsWith('.'))
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      try {
        await savePharmacist({ name, description, credentials, profileDescription, avatarUrl: initial.avatarUrl })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch { setError('Save failed — please try again') }
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
      <SaveRow isPending={isPending} saved={saved} error={error} onSave={handleSave} />
    </SectionCard>
  )
}

function ServicesSection({ initial }: { initial: SiteConfig['services'] }) {
  const [headline, setHeadline] = useState(initial.headline)
  const [subtitle, setSubtitle] = useState(initial.subtitle)
  const [items, setItems] = useState<ListItem[]>(initial.items)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addItem = () => setItems((p) => [...p, { id: crypto.randomUUID(), title: '', description: '' }])
  const removeItem = (id: string) => setItems((p) => p.filter((it) => it.id !== id))
  const updateItem = (id: string, field: 'title' | 'description', value: string) =>
    setItems((p) => p.map((it) => (it.id === id ? { ...it, [field]: value } : it)))

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      try {
        await saveServices({ headline, subtitle, items })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch { setError('Save failed — please try again') }
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
      <SaveRow isPending={isPending} saved={saved} error={error} onSave={handleSave} />
    </SectionCard>
  )
}

function TrustSection({ initial }: { initial: SiteConfig['trust'] }) {
  const [items, setItems] = useState<ListItem[]>(initial.items)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addItem = () => setItems((p) => [...p, { id: crypto.randomUUID(), title: '', description: '' }])
  const removeItem = (id: string) => setItems((p) => p.filter((it) => it.id !== id))
  const updateItem = (id: string, field: 'title' | 'description', value: string) =>
    setItems((p) => p.map((it) => (it.id === id ? { ...it, [field]: value } : it)))

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      try {
        await saveTrust({ items })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch { setError('Save failed — please try again') }
    })
  }

  return (
    <SectionCard title={`Why Kardinal (${items.length} reason${items.length !== 1 ? 's' : ''})`}>
      <div style={S.field}>
        <label style={S.label}>Reasons</label>
        <ItemsList items={items} onAdd={addItem} onRemove={removeItem} onUpdate={updateItem} addLabel="Add Reason" />
      </div>
      <SaveRow isPending={isPending} saved={saved} error={error} onSave={handleSave} />
    </SectionCard>
  )
}

function CosmeticSection({ initial }: { initial: SiteConfig['cosmeticLine'] }) {
  const [headline, setHeadline] = useState(initial.headline)
  const [subtitle, setSubtitle] = useState(initial.subtitle)
  const [items, setItems] = useState<ProductItem[]>(initial.items)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addItem = () => setItems((p) => [...p, { id: crypto.randomUUID(), title: '', description: '', price: '', imageUrl: '' }])
  const removeItem = (id: string) => setItems((p) => p.filter((it) => it.id !== id))
  const updateItem = (id: string, field: keyof Omit<ProductItem, 'id'>, value: string) =>
    setItems((p) => p.map((it) => (it.id === id ? { ...it, [field]: value } : it)))

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      try {
        await saveCosmeticLine({ headline, subtitle, items })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch { setError('Save failed — please try again') }
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
        <ProductItemsList items={items} onAdd={addItem} onRemove={removeItem} onUpdate={updateItem} />
      </div>
      <SaveRow isPending={isPending} saved={saved} error={error} onSave={handleSave} />
    </SectionCard>
  )
}

/* ── Users section (super admin only) ────────────────────── */
function UsersSection({ initialAdmins }: { initialAdmins: string[] }) {
  const [admins, setAdmins] = useState(initialAdmins)
  const [newEmail, setNewEmail] = useState('')
  const [addPending, startAdd] = useTransition()
  const [removePending, startRemove] = useTransition()
  const [addMessage, setAddMessage] = useState('')

  const handleAdd = () => {
    if (!newEmail.trim()) return
    startAdd(async () => {
      const trimmed = newEmail.trim().toLowerCase()
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const result = await response.json().catch(() => ({
        added: false,
        emailSent: false,
        error: 'Admin could not be added.',
      }))

      if (result.added) {
        setAdmins((prev) => prev.includes(trimmed) ? prev : [...prev, trimmed])
        setNewEmail('')
      }

      setAddMessage(
        result.emailSent
          ? 'Admin added and email sent.'
          : result.error ?? 'Admin was not added.',
      )
      setTimeout(() => setAddMessage(''), 4000)
    })
  }

  const handleRemove = (email: string) => {
    startRemove(async () => {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await response.json().catch(() => ({ removed: response.ok }))
      if (result.removed) {
        setAdmins((prev) => prev.filter((e) => e !== email))
      }
    })
  }

  return (
    <SectionCard title="User Management">
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 20 }}>
        These Google accounts can sign in and edit the site. The super admin cannot be removed.
      </p>

      <div style={{ marginBottom: 20 }}>
        {admins.map((email) => {
          const isSuper = email.toLowerCase() === SUPER_ADMIN.toLowerCase()
          return (
            <div
              className="admin-user-row"
              key={email}
              style={{
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
        <div className="admin-add-row" style={{ gap: 8 }}>
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
            {addPending ? 'Adding...' : 'Add'}
          </button>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
          {addMessage || 'The user must sign in with this exact Google account email.'}
        </p>
      </div>
    </SectionCard>
  )
}

function sameValue(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function changedClass(changed: boolean) {
  return changed ? ' admin-diff-changed' : ''
}

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter((word) => !word.endsWith('.'))
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
}

function itemChanged<T extends { id: string }>(item: T, otherItems: T[]) {
  const matchingItem = otherItems.find((otherItem) => otherItem.id === item.id)
  return !matchingItem || !sameValue(item, matchingItem)
}

function PreviewFrame({
  label,
  config,
  compareConfig,
  section,
}: {
  label: string
  config: SiteConfig
  compareConfig: SiteConfig
  section: string
}) {
  return (
    <div className="admin-diff-frame">
      <div className="admin-diff-frame-label">{label}</div>
      <SiteSnapshot config={config} compareConfig={compareConfig} section={section} />
    </div>
  )
}

function SiteSnapshot({
  config,
  compareConfig,
  section,
}: {
  config: SiteConfig
  compareConfig: SiteConfig
  section: string
}) {
  const normalizedSection = section.toLowerCase()

  if (normalizedSection.includes('site title')) {
    return (
      <div className="admin-diff-site-title">
        <span className={changedClass(config.siteTitle !== compareConfig.siteTitle)}>
          {config.siteTitle}
        </span>
        <nav>
          <span>Services</span>
          <span>About</span>
          <span>Visit</span>
        </nav>
      </div>
    )
  }

  if (normalizedSection.includes('hero')) {
    return <HeroSnapshot config={config} compareConfig={compareConfig} />
  }

  if (normalizedSection.includes('pharmacist')) {
    return <PharmacistSnapshot config={config} compareConfig={compareConfig} />
  }

  if (normalizedSection.includes('services')) {
    return <ServicesSnapshot config={config} compareConfig={compareConfig} />
  }

  if (normalizedSection.includes('why kardinal')) {
    return <TrustSnapshot config={config} compareConfig={compareConfig} />
  }

  if (normalizedSection.includes('cosmetic')) {
    return <CosmeticSnapshot config={config} compareConfig={compareConfig} />
  }

  return <OverviewSnapshot config={config} compareConfig={compareConfig} />
}

function HeroSnapshot({ config, compareConfig }: { config: SiteConfig; compareConfig: SiteConfig }) {
  const { hero, pharmacist } = config
  const compareHero = compareConfig.hero
  const comparePharmacist = compareConfig.pharmacist

  return (
    <div className="admin-diff-hero">
      <div>
        <p className="admin-diff-pill">Ijegun, Lagos</p>
        <h3>
          <span className={changedClass(hero.headlinePrimary !== compareHero.headlinePrimary)}>
            {hero.headlinePrimary}
          </span>
          <em className={changedClass(hero.headlineEmphasis !== compareHero.headlineEmphasis)}>
            {hero.headlineEmphasis}
          </em>
        </h3>
        <p className={changedClass(hero.subtitle !== compareHero.subtitle)}>{hero.subtitle}</p>
      </div>
      <div className="admin-diff-profile-card">
        <AvatarSnapshot
          name={pharmacist.name}
          avatarUrl={pharmacist.avatarUrl}
          changed={pharmacist.avatarUrl !== comparePharmacist.avatarUrl}
        />
        <strong className={changedClass(pharmacist.name !== comparePharmacist.name)}>{pharmacist.name}</strong>
        <span className={changedClass(pharmacist.description !== comparePharmacist.description)}>
          {pharmacist.description}
        </span>
      </div>
    </div>
  )
}

function PharmacistSnapshot({ config, compareConfig }: { config: SiteConfig; compareConfig: SiteConfig }) {
  const { pharmacist } = config
  const comparePharmacist = compareConfig.pharmacist

  return (
    <div className="admin-diff-about">
      <AvatarSnapshot
        name={pharmacist.name}
        avatarUrl={pharmacist.avatarUrl}
        changed={pharmacist.avatarUrl !== comparePharmacist.avatarUrl}
      />
      <div>
        <h3 className={changedClass(pharmacist.name !== comparePharmacist.name)}>{pharmacist.name}</h3>
        <p className={changedClass(pharmacist.description !== comparePharmacist.description)}>
          {pharmacist.description}
        </p>
        <p className={changedClass(pharmacist.profileDescription !== comparePharmacist.profileDescription)}>
          {pharmacist.profileDescription.split('\n\n')[0] || 'No profile text'}
        </p>
        <div className="admin-diff-tags">
          {pharmacist.credentials.map((credential) => (
            <span
              key={credential}
              className={changedClass(!comparePharmacist.credentials.includes(credential))}
            >
              {credential}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ServicesSnapshot({ config, compareConfig }: { config: SiteConfig; compareConfig: SiteConfig }) {
  const { services } = config
  const compareServices = compareConfig.services

  return (
    <div>
      <div className="admin-diff-section-head">
        <h3 className={changedClass(services.headline !== compareServices.headline)}>{services.headline}</h3>
        <p className={changedClass(services.subtitle !== compareServices.subtitle)}>{services.subtitle}</p>
      </div>
      <div className="admin-diff-card-grid">
        {services.items.slice(0, 4).map((item) => (
          <div key={item.id} className={`admin-diff-mini-card${changedClass(itemChanged(item, compareServices.items))}`}>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrustSnapshot({ config, compareConfig }: { config: SiteConfig; compareConfig: SiteConfig }) {
  const { trust } = config
  const compareTrust = compareConfig.trust

  return (
    <div className="admin-diff-card-grid">
      {trust.items.slice(0, 4).map((item) => (
        <div key={item.id} className={`admin-diff-mini-card${changedClass(itemChanged(item, compareTrust.items))}`}>
          <strong>{item.title}</strong>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  )
}

function CosmeticSnapshot({ config, compareConfig }: { config: SiteConfig; compareConfig: SiteConfig }) {
  const { cosmeticLine } = config
  const compareLine = compareConfig.cosmeticLine

  return (
    <div className="admin-diff-products">
      <div className="admin-diff-section-head">
        <h3 className={changedClass(cosmeticLine.headline !== compareLine.headline)}>{cosmeticLine.headline}</h3>
        <p className={changedClass(cosmeticLine.subtitle !== compareLine.subtitle)}>{cosmeticLine.subtitle}</p>
      </div>
      <div className="admin-diff-card-grid">
        {cosmeticLine.items.slice(0, 4).map((item) => (
          <div key={item.id} className={`admin-diff-mini-card${changedClass(itemChanged(item, compareLine.items))}`}>
            {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <div className="admin-diff-image-placeholder" />}
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            {item.price && <span>₦{item.price}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function OverviewSnapshot({ config, compareConfig }: { config: SiteConfig; compareConfig: SiteConfig }) {
  const rows = [
    { label: 'Site', value: config.siteTitle, changed: config.siteTitle !== compareConfig.siteTitle },
    { label: 'Hero', value: config.hero.headlinePrimary, changed: !sameValue(config.hero, compareConfig.hero) },
    { label: 'Pharmacist', value: config.pharmacist.name, changed: !sameValue(config.pharmacist, compareConfig.pharmacist) },
    { label: 'Services', value: config.services.headline, changed: !sameValue(config.services, compareConfig.services) },
    { label: 'Why Kardinal', value: `${config.trust.items.length} reasons`, changed: !sameValue(config.trust, compareConfig.trust) },
    { label: 'Cosmetics', value: config.cosmeticLine.headline, changed: !sameValue(config.cosmeticLine, compareConfig.cosmeticLine) },
  ]

  return (
    <div className="admin-diff-overview">
      {rows.map((row) => (
        <div key={row.label} className={changedClass(row.changed)}>
          <strong>{row.label}</strong>
          <span>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

function AvatarSnapshot({ name, avatarUrl, changed }: { name: string; avatarUrl: string; changed: boolean }) {
  return (
    <div className={`admin-diff-avatar${changedClass(changed)}`}>
      {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initialsFromName(name)}</span>}
    </div>
  )
}

function HistoryDiff({ log }: { log: SiteAuditLog }) {
  return (
    <div className="admin-diff-panel">
      <div className="admin-diff-legend">
        <span className="admin-diff-chip">Highlighted content changed in this revision</span>
      </div>
      <div className="admin-diff-grid">
        <PreviewFrame
          label="Before"
          config={log.beforeConfig}
          compareConfig={log.afterConfig}
          section={log.section}
        />
        <PreviewFrame
          label="After"
          config={log.afterConfig}
          compareConfig={log.beforeConfig}
          section={log.section}
        />
      </div>
    </div>
  )
}

function HistorySection({ logs }: { logs: SiteAuditLog[] }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [openLogId, setOpenLogId] = useState<string | null>(logs[0]?.id ?? null)

  const restore = (id: string, snapshot: 'before' | 'after') => {
    startTransition(async () => {
      const response = await fetch('/api/admin/audit/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, snapshot }),
      })
      const result = await response.json().catch(() => ({ restored: false, error: 'Rollback failed.' }))
      if (result.restored) {
        setMessage('Site restored. Reloading...')
        window.location.reload()
        return
      }
      setMessage(result.error ?? 'Rollback failed.')
    })
  }

  return (
    <SectionCard title="Change History">
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 20 }}>
        Site edits are recorded with the editor, timestamp, and full site snapshot. Restoring a version creates a new rollback entry.
      </p>
      {message && <p style={{ fontSize: '0.82rem', color: 'var(--green-700)', marginBottom: 12 }}>{message}</p>}
      {logs.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No site changes have been recorded yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {logs.map((log, index) => {
            const isOpen = openLogId === log.id
            const isLatest = index === 0

            return (
              <div
                key={log.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 14,
                  background: 'var(--white)',
                }}
              >
                <button
                  type="button"
                  className="admin-history-row"
                  aria-expanded={isOpen}
                  onClick={() => setOpenLogId(isOpen ? null : log.id)}
                  style={{
                    width: '100%',
                    border: 0,
                    background: 'transparent',
                    padding: 0,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'var(--font)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>
                      {log.section}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)', marginTop: 3 }}>
                      {log.summary}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                      {log.actorEmail} · {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--green-700)',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {isOpen ? 'Hide diff' : 'View diff'}
                  </span>
                </button>

                {isOpen && (
                  <>
                    <HistoryDiff log={log} />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                      <button
                        type="button"
                        onClick={() => restore(log.id, 'before')}
                        disabled={isPending}
                        style={{ ...S.deleteBtn, opacity: isPending ? 0.6 : 1 }}
                      >
                        Restore before
                      </button>
                      <button
                        type="button"
                        onClick={() => restore(log.id, 'after')}
                        disabled={isPending || isLatest}
                        title={isLatest ? 'This is already the current saved version.' : undefined}
                        style={{
                          ...S.saveBtn,
                          borderRadius: 'var(--radius-sm)',
                          opacity: isPending || isLatest ? 0.45 : 1,
                          cursor: isLatest ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isLatest ? 'Current version' : 'Restore after'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}

/* ── Root ─────────────────────────────────────────────────── */
export default function AdminForms({
  config,
  userEmail,
  admins,
  auditLogs,
}: {
  config: SiteConfig
  userEmail: string
  admins: string[]
  auditLogs: SiteAuditLog[]
}) {
  const isSuperAdmin = userEmail.toLowerCase() === SUPER_ADMIN.toLowerCase()
  const sections = isSuperAdmin
    ? [...BASE_SECTIONS, { id: 'users' as SectionId, label: 'Users' }, { id: 'history' as SectionId, label: 'History' }]
    : BASE_SECTIONS

  const [active, setActive] = useState<SectionId>('site')

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
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
      </aside>

      {/* Content pane */}
      <div className="admin-content">
        {active === 'site'       && <SiteTitleSection  initial={config.siteTitle}    />}
        {active === 'hero'       && <HeroSection        initial={config.hero}         />}
        {active === 'pharmacist' && <PharmacistSection  initial={config.pharmacist}   />}
        {active === 'services'   && <ServicesSection    initial={config.services}     />}
        {active === 'trust'      && <TrustSection       initial={config.trust}        />}
        {active === 'cosmetic'   && <CosmeticSection    initial={config.cosmeticLine} />}
        {active === 'users' && isSuperAdmin && <UsersSection initialAdmins={admins} />}
        {active === 'history' && isSuperAdmin && <HistorySection logs={auditLogs} />}
      </div>
    </div>
  )
}
