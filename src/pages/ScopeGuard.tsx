import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Priority = 'must' | 'should' | 'nice' | 'no'
type Effort = 'L' | 'M' | 'H'

interface Feature {
  id: number
  name: string
  priority: Priority
  effort: Effort
}

const labels: Record<Priority, { label: string; color: string; bg: string; borderColor: string; desc: string; emoji: string }> = {
  must:   { label: 'MUST HAVE',    color: 'var(--accent)',  bg: 'rgba(167,139,250,0.06)',  borderColor: 'rgba(167,139,250,0.2)',  desc: 'Core demo flow',   emoji: '🎯' },
  should: { label: 'SHOULD HAVE',  color: 'var(--blue)',    bg: 'rgba(147,197,253,0.06)',  borderColor: 'rgba(147,197,253,0.2)',  desc: 'Strong addition',  emoji: '✅' },
  nice:   { label: 'NICE TO HAVE', color: 'var(--yellow)',  bg: 'rgba(253,230,138,0.06)',  borderColor: 'rgba(253,230,138,0.2)',  desc: 'Post-hackathon',   emoji: '💡' },
  no:     { label: "WON'T BUILD",  color: 'var(--red)',     bg: 'rgba(252,165,165,0.06)',  borderColor: 'rgba(252,165,165,0.2)',  desc: 'Cut it now',       emoji: '✂️' },
}

const effortLabels: Record<Effort, { label: string; color: string }> = {
  L: { label: 'Low',  color: 'var(--green)' },
  M: { label: 'Med',  color: 'var(--yellow)' },
  H: { label: 'High', color: 'var(--red)' },
}

const initialFeatures: Feature[] = [
  { id: 1, name: 'User Authentication',    priority: 'must'   as Priority, effort: 'M' as Effort },
  { id: 2, name: 'AI Chat Interface',      priority: 'must'   as Priority, effort: 'M' as Effort },
  { id: 3, name: 'Real-time Collaboration',priority: 'nice'   as Priority, effort: 'H' as Effort },
  { id: 4, name: 'Mobile App',             priority: 'no'     as Priority, effort: 'H' as Effort },
  { id: 5, name: 'Dashboard & Metrics',    priority: 'should' as Priority, effort: 'L' as Effort },
  { id: 6, name: 'GitHub Integration',     priority: 'should' as Priority, effort: 'M' as Effort },
  { id: 7, name: 'Notification System',    priority: 'nice'   as Priority, effort: 'L' as Effort },
  { id: 8, name: 'CSV Export',             priority: 'no'     as Priority, effort: 'L' as Effort },
]

const moveTargets: Record<Priority, { key: Priority; shortLabel: string }[]> = {
  must:   [{ key: 'should', shortLabel: 'Should' }, { key: 'nice', shortLabel: 'Nice' }, { key: 'no', shortLabel: "Won't" }],
  should: [{ key: 'must',   shortLabel: 'Must' },   { key: 'nice', shortLabel: 'Nice' }, { key: 'no', shortLabel: "Won't" }],
  nice:   [{ key: 'must',   shortLabel: 'Must' },   { key: 'should', shortLabel: 'Should' }, { key: 'no', shortLabel: "Won't" }],
  no:     [{ key: 'must',   shortLabel: 'Must' },   { key: 'should', shortLabel: 'Should' }, { key: 'nice', shortLabel: 'Nice' }],
}

export default function ScopeGuard() {
  const [features, setFeatures] = useLocalStorage<Feature[]>('sp_scopeFeatures', initialFeatures)
  const [newName, setNewName] = useState('')
  const [newEffort, setNewEffort] = useState<Effort>('M')
  const [dragId, setDragId] = useState<number | null>(null)
  const [dragOverBucket, setDragOverBucket] = useState<Priority | null>(null)

  const setPriority = (id: number, p: Priority) =>
    setFeatures(f => f.map(x => x.id === id ? { ...x, priority: p } : x))

  const removeFeature = (id: number) =>
    setFeatures(f => f.filter(x => x.id !== id))

  const addFeature = () => {
    if (!newName.trim()) return
    setFeatures(f => [...f, { id: Date.now(), name: newName.trim(), priority: 'nice', effort: newEffort }])
    setNewName('')
    setNewEffort('M')
  }

  const handleDrop = (p: Priority) => {
    if (dragId !== null) {
      setPriority(dragId, p)
      setDragId(null)
      setDragOverBucket(null)
    }
  }

  const groups = (['must', 'should', 'nice', 'no'] as Priority[]).map(p => ({
    p,
    items: features.filter(f => f.priority === p),
    ...labels[p],
  }))

  // Stats
  const mustCount  = features.filter(f => f.priority === 'must').length
  const mustEffort = features.filter(f => f.priority === 'must').reduce((acc, f) => acc + (f.effort === 'H' ? 3 : f.effort === 'M' ? 2 : 1), 0)
  const maxEffort  = mustCount * 3
  const scopeScore = maxEffort ? Math.max(0, Math.round(100 - (mustEffort / maxEffort) * 100)) : 100

  return (
    <div className="fade-up" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>◻ Scope Guardian</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>
            MoSCoW prioritization — drag cards or use the move buttons.
          </p>
        </div>
        {/* Scope health */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '12px 18px', textAlign: 'center', flexShrink: 0,
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 6 }}>SCOPE HEALTH</div>
          <div style={{
            fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)',
            color: scopeScore > 60 ? 'var(--green)' : scopeScore > 30 ? 'var(--yellow)' : 'var(--red)',
          }}>{scopeScore}%</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            {mustCount} must-have{mustCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Add feature */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center' }}>
        <input
          className="input"
          placeholder="Add a feature…"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addFeature()}
          style={{ flex: 1 }}
        />
        {/* Effort selector */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 4 }}>
          {(['L', 'M', 'H'] as Effort[]).map(e => (
            <button
              key={e}
              onClick={() => setNewEffort(e)}
              style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: newEffort === e ? effortLabels[e].color : 'transparent',
                color: newEffort === e ? '#0d0d18' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
              title={`Effort: ${effortLabels[e].label}`}
            >{e}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={addFeature}>+ Add</button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {groups.map(({ p, items, label, color, bg, borderColor, desc, emoji }) => (
          <div
            key={p}
            onDragOver={e => { e.preventDefault(); setDragOverBucket(p) }}
            onDragLeave={() => setDragOverBucket(null)}
            onDrop={() => handleDrop(p)}
            style={{
              background: dragOverBucket === p ? bg : 'var(--bg-surface)',
              borderRadius: 14,
              border: `1px solid ${dragOverBucket === p ? color + '55' : borderColor}`,
              overflow: 'hidden',
              transition: 'all 0.2s',
              boxShadow: dragOverBucket === p ? `0 0 0 2px ${color}22` : 'none',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '12px 16px', background: bg,
              borderBottom: `1px solid ${borderColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{emoji}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color }}>{label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{desc}</div>
                </div>
              </div>
              <div style={{
                minWidth: 22, height: 22, borderRadius: '50%',
                background: color, color: '#060a08',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, padding: '0 6px',
              }}>{items.length}</div>
            </div>

            {/* Items */}
            <div style={{ padding: '10px 12px', minHeight: 80, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.length === 0 && (
                <div style={{
                  color: 'var(--text-muted)', fontSize: 12, textAlign: 'center',
                  padding: '20px 0', border: `2px dashed ${borderColor}`,
                  borderRadius: 8, margin: '4px 0',
                  opacity: dragOverBucket === p ? 0.8 : 0.4,
                  transition: 'opacity 0.2s',
                }}>
                  {dragOverBucket === p ? '↓ Drop here' : 'Drag features here'}
                </div>
              )}
              {items.map(f => (
                <div
                  key={f.id}
                  draggable
                  onDragStart={() => setDragId(f.id)}
                  onDragEnd={() => { setDragId(null); setDragOverBucket(null) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 12px', borderRadius: 8,
                    background: dragId === f.id ? bg : 'var(--bg-elevated)',
                    border: `1px solid ${dragId === f.id ? borderColor : 'var(--border)'}`,
                    cursor: 'grab', opacity: dragId === f.id ? 0.5 : 1,
                    transition: 'all 0.15s',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: 10, cursor: 'grab' }}>⠿</span>
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{f.name}</div>
                  <span style={{
                    fontSize: 10, fontFamily: 'var(--font-mono)',
                    background: `color-mix(in srgb, ${effortLabels[f.effort].color} 12%, transparent)`,
                    color: effortLabels[f.effort].color,
                    padding: '2px 7px', borderRadius: 4, fontWeight: 600, flexShrink: 0,
                  }}>
                    {f.effort}
                  </span>
                  {/* Move buttons */}
                  <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                    {moveTargets[p].map(({ key, shortLabel }) => (
                      <button
                        key={key}
                        onClick={() => setPriority(f.id, key)}
                        title={`Move to ${labels[key].label}`}
                        style={{
                          height: 20, borderRadius: 4,
                          background: labels[key].bg,
                          border: `1px solid ${labels[key].borderColor}`,
                          fontSize: 9, color: labels[key].color,
                          cursor: 'pointer', fontWeight: 700,
                          padding: '0 6px', whiteSpace: 'nowrap',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >{shortLabel}</button>
                    ))}
                    <button
                      onClick={() => removeFeature(f.id)}
                      title="Remove feature"
                      style={{
                        width: 20, height: 20, borderRadius: 4,
                        background: 'transparent', border: '1px solid var(--border)',
                        fontSize: 12, color: 'var(--text-muted)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 20, padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>EFFORT:</span>
        {(['L', 'M', 'H'] as Effort[]).map(e => (
          <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: effortLabels[e].color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{e} = {effortLabels[e].label} effort</span>
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>💡 Drag cards between columns</span>
      </div>
    </div>
  )
}
