'use client'

import { useState, useTransition } from 'react'
import type { SiteAuditLog, SiteConfig } from '@/lib/types'

const restoreBeforeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid #fca5a5',
  color: '#ef4444',
  borderRadius: 4,
  padding: '3px 9px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  fontFamily: 'var(--font)',
}

const restoreAfterButtonStyle: React.CSSProperties = {
  background: 'var(--green-800)',
  color: 'var(--white)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '9px 22px',
  fontFamily: 'var(--font)',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'pointer',
}

function valuesMatch(firstValue: unknown, secondValue: unknown) {
  return JSON.stringify(firstValue) === JSON.stringify(secondValue)
}

function highlightedWhen(hasChanged: boolean) {
  return hasChanged ? ' admin-diff-changed' : ''
}

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter((word) => !word.endsWith('.'))
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
}

function listItemChanged<T extends { id: string }>(item: T, comparisonItems: T[]) {
  const matchingItem = comparisonItems.find((comparisonItem) => comparisonItem.id === item.id)
  return !matchingItem || !valuesMatch(item, matchingItem)
}

function DiffFrame({
  label,
  config,
  comparisonConfig,
  section,
}: {
  label: string
  config: SiteConfig
  comparisonConfig: SiteConfig
  section: string
}) {
  return (
    <div className="admin-diff-frame">
      <div className="admin-diff-frame-label">{label}</div>
      <SiteSnapshot config={config} comparisonConfig={comparisonConfig} section={section} />
    </div>
  )
}

function SiteSnapshot({
  config,
  comparisonConfig,
  section,
}: {
  config: SiteConfig
  comparisonConfig: SiteConfig
  section: string
}) {
  const sectionName = section.toLowerCase()

  if (sectionName.includes('site title')) {
    return (
      <div className="admin-diff-site-title">
        <span className={highlightedWhen(config.siteTitle !== comparisonConfig.siteTitle)}>
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

  if (sectionName.includes('hero')) {
    return <HeroSnapshot config={config} comparisonConfig={comparisonConfig} />
  }

  if (sectionName.includes('pharmacist')) {
    return <PharmacistSnapshot config={config} comparisonConfig={comparisonConfig} />
  }

  if (sectionName.includes('services')) {
    return <ServicesSnapshot config={config} comparisonConfig={comparisonConfig} />
  }

  if (sectionName.includes('why kardinal')) {
    return <TrustSnapshot config={config} comparisonConfig={comparisonConfig} />
  }

  if (sectionName.includes('cosmetic')) {
    return <CosmeticSnapshot config={config} comparisonConfig={comparisonConfig} />
  }

  return <OverviewSnapshot config={config} comparisonConfig={comparisonConfig} />
}

function HeroSnapshot({ config, comparisonConfig }: { config: SiteConfig; comparisonConfig: SiteConfig }) {
  const { hero, pharmacist } = config
  const previousHero = comparisonConfig.hero
  const previousPharmacist = comparisonConfig.pharmacist

  return (
    <div className="admin-diff-hero">
      <div>
        <p className="admin-diff-pill">Ijegun, Lagos</p>
        <h3>
          <span className={highlightedWhen(hero.headlinePrimary !== previousHero.headlinePrimary)}>
            {hero.headlinePrimary}
          </span>
          <em className={highlightedWhen(hero.headlineEmphasis !== previousHero.headlineEmphasis)}>
            {hero.headlineEmphasis}
          </em>
        </h3>
        <p className={highlightedWhen(hero.subtitle !== previousHero.subtitle)}>{hero.subtitle}</p>
      </div>
      <div className="admin-diff-profile-card">
        <AvatarSnapshot
          name={pharmacist.name}
          avatarUrl={pharmacist.avatarUrl}
          changed={pharmacist.avatarUrl !== previousPharmacist.avatarUrl}
        />
        <strong className={highlightedWhen(pharmacist.name !== previousPharmacist.name)}>{pharmacist.name}</strong>
        <span className={highlightedWhen(pharmacist.description !== previousPharmacist.description)}>
          {pharmacist.description}
        </span>
      </div>
    </div>
  )
}

function PharmacistSnapshot({ config, comparisonConfig }: { config: SiteConfig; comparisonConfig: SiteConfig }) {
  const { pharmacist } = config
  const previousPharmacist = comparisonConfig.pharmacist

  return (
    <div className="admin-diff-about">
      <AvatarSnapshot
        name={pharmacist.name}
        avatarUrl={pharmacist.avatarUrl}
        changed={pharmacist.avatarUrl !== previousPharmacist.avatarUrl}
      />
      <div>
        <h3 className={highlightedWhen(pharmacist.name !== previousPharmacist.name)}>{pharmacist.name}</h3>
        <p className={highlightedWhen(pharmacist.description !== previousPharmacist.description)}>
          {pharmacist.description}
        </p>
        <p className={highlightedWhen(pharmacist.profileDescription !== previousPharmacist.profileDescription)}>
          {pharmacist.profileDescription.split('\n\n')[0] || 'No profile text'}
        </p>
        <div className="admin-diff-tags">
          {pharmacist.credentials.map((credential) => (
            <span
              key={credential}
              className={highlightedWhen(!previousPharmacist.credentials.includes(credential))}
            >
              {credential}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ServicesSnapshot({ config, comparisonConfig }: { config: SiteConfig; comparisonConfig: SiteConfig }) {
  const { services } = config
  const previousServices = comparisonConfig.services

  return (
    <div>
      <div className="admin-diff-section-head">
        <h3 className={highlightedWhen(services.headline !== previousServices.headline)}>{services.headline}</h3>
        <p className={highlightedWhen(services.subtitle !== previousServices.subtitle)}>{services.subtitle}</p>
      </div>
      <div className="admin-diff-card-grid">
        {services.items.slice(0, 4).map((item) => (
          <div key={item.id} className={`admin-diff-mini-card${highlightedWhen(listItemChanged(item, previousServices.items))}`}>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrustSnapshot({ config, comparisonConfig }: { config: SiteConfig; comparisonConfig: SiteConfig }) {
  const { trust } = config
  const previousTrust = comparisonConfig.trust

  return (
    <div className="admin-diff-card-grid">
      {trust.items.slice(0, 4).map((item) => (
        <div key={item.id} className={`admin-diff-mini-card${highlightedWhen(listItemChanged(item, previousTrust.items))}`}>
          <strong>{item.title}</strong>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  )
}

function CosmeticSnapshot({ config, comparisonConfig }: { config: SiteConfig; comparisonConfig: SiteConfig }) {
  const { cosmeticLine } = config
  const previousCosmeticLine = comparisonConfig.cosmeticLine

  return (
    <div className="admin-diff-products">
      <div className="admin-diff-section-head">
        <h3 className={highlightedWhen(cosmeticLine.headline !== previousCosmeticLine.headline)}>{cosmeticLine.headline}</h3>
        <p className={highlightedWhen(cosmeticLine.subtitle !== previousCosmeticLine.subtitle)}>{cosmeticLine.subtitle}</p>
      </div>
      <div className="admin-diff-card-grid">
        {cosmeticLine.items.slice(0, 4).map((item) => (
          <div key={item.id} className={`admin-diff-mini-card${highlightedWhen(listItemChanged(item, previousCosmeticLine.items))}`}>
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

function OverviewSnapshot({ config, comparisonConfig }: { config: SiteConfig; comparisonConfig: SiteConfig }) {
  const rows = [
    { label: 'Site', value: config.siteTitle, changed: config.siteTitle !== comparisonConfig.siteTitle },
    { label: 'Hero', value: config.hero.headlinePrimary, changed: !valuesMatch(config.hero, comparisonConfig.hero) },
    { label: 'Pharmacist', value: config.pharmacist.name, changed: !valuesMatch(config.pharmacist, comparisonConfig.pharmacist) },
    { label: 'Services', value: config.services.headline, changed: !valuesMatch(config.services, comparisonConfig.services) },
    { label: 'Why Kardinal', value: `${config.trust.items.length} reasons`, changed: !valuesMatch(config.trust, comparisonConfig.trust) },
    { label: 'Cosmetics', value: config.cosmeticLine.headline, changed: !valuesMatch(config.cosmeticLine, comparisonConfig.cosmeticLine) },
  ]

  return (
    <div className="admin-diff-overview">
      {rows.map((row) => (
        <div key={row.label} className={highlightedWhen(row.changed)}>
          <strong>{row.label}</strong>
          <span>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

function AvatarSnapshot({ name, avatarUrl, changed }: { name: string; avatarUrl: string; changed: boolean }) {
  return (
    <div className={`admin-diff-avatar${highlightedWhen(changed)}`}>
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
        <DiffFrame
          label="Before"
          config={log.beforeConfig}
          comparisonConfig={log.afterConfig}
          section={log.section}
        />
        <DiffFrame
          label="After"
          config={log.afterConfig}
          comparisonConfig={log.beforeConfig}
          section={log.section}
        />
      </div>
    </div>
  )
}

export default function AdminHistory({ logs }: { logs: SiteAuditLog[] }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [openLogId, setOpenLogId] = useState<string | null>(logs[0]?.id ?? null)

  const restoreSnapshot = (id: string, snapshot: 'before' | 'after') => {
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
    <div>
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
                        onClick={() => restoreSnapshot(log.id, 'before')}
                        disabled={isPending}
                        style={{ ...restoreBeforeButtonStyle, opacity: isPending ? 0.6 : 1 }}
                      >
                        Restore before
                      </button>
                      <button
                        type="button"
                        onClick={() => restoreSnapshot(log.id, 'after')}
                        disabled={isPending || isLatest}
                        title={isLatest ? 'This is already the current saved version.' : undefined}
                        style={{
                          ...restoreAfterButtonStyle,
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
    </div>
  )
}
