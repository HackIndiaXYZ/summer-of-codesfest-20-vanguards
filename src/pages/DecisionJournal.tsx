import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Decision = {
  id: number
  title: string
  rationale: string
  tradeoffs: string
  author: string
  time: string
  category: string
}

const categories = [
  { label: 'Tech', color: 'var(--blue)',   icon: '◈' },
  { label: 'Product', color: 'var(--accent)', icon: '◉' },
  { label: 'Scope', color: 'var(--yellow)', icon: '◻' },
  { label: 'Team', color: 'var(--green)',  icon: '◆' },
]

const seed: Decision[] = [
  { id: 1, title: 'Use Firebase instead of Postgres', rationale: 'Only 24 hours. Setting up auth + realtime db is much faster. Complex queries not needed for MVP.', tradeoffs: 'Harder to migrate later. Must denormalize data.', author: 'Alice', time: '2h ago', category: 'Tech' },
  { id: 2, title: 'Drop Mobile App feature', rationale: 'Scope was too large. Focus entirely on responsive web version for a polished demo.', tradeoffs: 'Lose potential mobile-first users. No native push notifications.', author: 'Bob', time: '5h ago', category: 'Scope' },
]

const catColor = (cat: string) => categories.find(c => c.label === cat)?.color ?? 'var(--text-muted)'
const catIcon  = (cat: string) => categories.find(c => c.label === cat)?.icon ?? '◈'

export default function DecisionJournal() {
  const [decisions, setDecisions] = useLocalStorage<Decision[]>('sp_decisionLogs', seed)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', rationale: '', tradeoffs: '', author: 'You', category: 'Tech' })

  const save = () => {
    if (!form.title || !form.rationale) return
    setDecisions(d => [{ id: Date.now(), ...form, time: 'Just now' }, ...d])
    setForm({ title: '', rationale: '', tradeoffs: '', author: 'You', category: 'Tech' })
    setOpen(false)
  }

  const filtered = filter ? decisions.filter(d => d.category === filter) : decisions

  return (
    <div className="fade-up" style={{ maxWidth: 720 }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>◷ Decision Journal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>
            Log technical and product decisions so you don't argue about them later.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Log Decision</button>
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter(null)}
          style={{
            padding: '5px 14px', borderRadius: 99, border: `1px solid ${filter === null ? 'var(--border-bright)' : 'var(--border)'}`,
            background: filter === null ? 'var(--bg-elevated)' : 'transparent',
            color: filter === null ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
          }}
        >All ({decisions.length})</button>
        {categories.map(c => {
          const count = decisions.filter(d => d.category === c.label).length
          return (
            <button
              key={c.label}
              onClick={() => setFilter(filter === c.label ? null : c.label)}
              style={{
                padding: '5px 14px', borderRadius: 99,
                border: `1px solid ${filter === c.label ? c.color + '66' : 'var(--border)'}`,
                background: filter === c.label ? `color-mix(in srgb, ${c.color} 10%, transparent)` : 'transparent',
                color: filter === c.label ? c.color : 'var(--text-muted)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span>{c.icon}</span>{c.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Modal */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }} onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, width: 500, maxWidth: '90vw', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--accent)' }}>◷</span> Log a Decision
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Category *</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {categories.map(c => (
                    <button
                      key={c.label}
                      onClick={() => setForm({ ...form, category: c.label })}
                      style={{
                        padding: '5px 12px', borderRadius: 8, border: `1px solid ${form.category === c.label ? c.color + '66' : 'var(--border)'}`,
                        background: form.category === c.label ? `color-mix(in srgb, ${c.color} 12%, transparent)` : 'transparent',
                        color: form.category === c.label ? c.color : 'var(--text-muted)',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}
                    ><span>{c.icon}</span>{c.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Decision Title *</label>
                <input className="input" placeholder="e.g. Use Firebase instead of Postgres" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Rationale *</label>
                <textarea className="textarea" rows={3} placeholder="Why did we make this choice?" value={form.rationale} onChange={e => setForm({ ...form, rationale: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Tradeoffs <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <textarea className="textarea" rows={2} placeholder="What are we sacrificing?" value={form.tradeoffs} onChange={e => setForm({ ...form, tradeoffs: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Author</label>
                <input className="input" placeholder="Your name" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={save} disabled={!form.title || !form.rationale}>Save Decision</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {categories.map(c => {
          const count = decisions.filter(d => d.category === c.label).length
          return (
            <div key={c.label} style={{
              background: 'var(--bg-surface)', border: `1px solid ${count > 0 ? c.color + '22' : 'var(--border)'}`,
              borderRadius: 10, padding: '12px 14px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onClick={() => setFilter(filter === c.label ? null : c.label)}
            >
              <div style={{ fontSize: 16, color: c.color, marginBottom: 4 }}>{c.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: count > 0 ? c.color : 'var(--text-muted)' }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.label}</div>
            </div>
          )
        })}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          No decisions logged yet — start recording your choices!
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(d => (
              <div key={d.id} style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: -24, top: 18,
                  width: 12, height: 12, borderRadius: '50%',
                  background: 'var(--bg-surface)', border: `2px solid ${catColor(d.category)}`,
                  boxShadow: `0 0 8px ${catColor(d.category)}44`,
                }} />
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: catColor(d.category),
                        background: `color-mix(in srgb, ${catColor(d.category)} 10%, transparent)`,
                        border: `1px solid ${catColor(d.category)}33`,
                        padding: '2px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        {catIcon(d.category)} {d.category}
                      </span>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{d.title}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.time}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>by {d.author}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4 }}>RATIONALE</div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: d.tradeoffs ? 12 : 0 }}>{d.rationale}</p>
                  </div>
                  {d.tradeoffs && (
                    <div style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4 }}>TRADEOFFS</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{d.tradeoffs}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
