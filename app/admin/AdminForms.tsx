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
} from './actions'

/* ── Shared styles ──────────────────────────────────────── */
const S = {
  card: {
    background: 'var(--white)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    marginBottom: 20,
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

/* ── Primitives ─────────────────────────────────────────── */
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

/* ── Section components ─────────────────────────────────── */
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

  const handleSave = () => {
    startTransition(async () => {
      await savePharmacist({ name, description, credentials, profileDescription })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <SectionCard title="Pharmacist">
      <Field label="Full Name">
        <input value={name} onChange={(e) => setName(e.target.value)} style={S.input} />
      </Field>
      <Field label="Role / Description">
        <input value={description} onChange={(e) => setDescription(e.target.value)} style={S.input} />
      </Field>
      <Field label="Credentials (shown as badges on hero card and checklist on about page)">
        <CredentialsList items={credentials} onChange={setCredentials} />
      </Field>
      <Field label="Profile description (use a blank line between paragraphs)">
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

  const addItem = () => setItems((prev) => [...prev, { id: crypto.randomUUID(), title: '', description: '' }])
  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id))
  const updateItem = (id: string, field: 'title' | 'description', value: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)))

  const handleSave = () => {
    startTransition(async () => {
      await saveServices({ headline, subtitle, items })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <SectionCard title={`Services — What We Offer (${items.length} item${items.length !== 1 ? 's' : ''}${items.length > 3 ? ' · carousel active' : ''})`}>
      <Field label="Headline">
        <input value={headline} onChange={(e) => setHeadline(e.target.value)} style={S.input} />
      </Field>
      <Field label="Subtitle">
        <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={S.textarea} rows={2} />
      </Field>
      <div style={S.field}>
        <label style={S.label}>Services</label>
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

  const addItem = () => setItems((prev) => [...prev, { id: crypto.randomUUID(), title: '', description: '' }])
  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id))
  const updateItem = (id: string, field: 'title' | 'description', value: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)))

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

  const addItem = () => setItems((prev) => [...prev, { id: crypto.randomUUID(), title: '', description: '' }])
  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id))
  const updateItem = (id: string, field: 'title' | 'description', value: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)))

  const handleSave = () => {
    startTransition(async () => {
      await saveCosmeticLine({ headline, subtitle, items })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <SectionCard title={`Our Cosmetic Line (${items.length} product${items.length !== 1 ? 's' : ''}${items.length > 3 ? ' · carousel active' : ''})`}>
      <Field label="Headline">
        <input value={headline} onChange={(e) => setHeadline(e.target.value)} style={S.input} />
      </Field>
      <Field label="Subtitle">
        <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={S.textarea} rows={2} />
      </Field>
      <div style={S.field}>
        <label style={S.label}>Products</label>
        <ItemsList items={items} onAdd={addItem} onRemove={removeItem} onUpdate={updateItem} addLabel="Add Product" />
      </div>
      <SaveRow isPending={isPending} saved={saved} onSave={handleSave} />
    </SectionCard>
  )
}

/* ── Root export ────────────────────────────────────────── */
export default function AdminForms({ config }: { config: SiteConfig }) {
  return (
    <div>
      <SiteTitleSection initial={config.siteTitle} />
      <HeroSection initial={config.hero} />
      <PharmacistSection initial={config.pharmacist} />
      <ServicesSection initial={config.services} />
      <TrustSection initial={config.trust} />
      <CosmeticSection initial={config.cosmeticLine} />
    </div>
  )
}
