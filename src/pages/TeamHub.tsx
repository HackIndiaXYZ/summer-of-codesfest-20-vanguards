import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Role = 'Lead' | 'Frontend' | 'Backend' | 'Design' | 'AI/ML' | 'Full-Stack'
type Status = 'active' | 'away' | 'blocked'

type Member = {
  id: number
  name: string
  role: Role
  status: Status
  tasks: string[]
  avatar: string
}

const roles: Role[] = ['Lead', 'Frontend', 'Backend', 'Design', 'AI/ML', 'Full-Stack']
const statusMeta: Record<Status, { label: string; color: string; dot: string }> = {
  active:  { label: 'Active',   color: 'var(--green)',  dot: '#22c55e' },
  away:    { label: 'Away',     color: 'var(--yellow)', dot: '#eab308' },
  blocked: { label: 'Blocked',  color: 'var(--red)',    dot: '#ef4444' },
}

const roleColors: Record<Role, string> = {
  'Lead':       'var(--accent)',
  'Frontend':   'var(--blue)',
  'Backend':    'var(--green)',
  'Design':     'var(--accent3)',
  'AI/ML':      'var(--yellow)',
  'Full-Stack': 'var(--accent2)',
}

const avatarColors = [
  'linear-gradient(135deg, #a78bfa, #6ee7b7)',
  'linear-gradient(135deg, #93c5fd, #a78bfa)',
  'linear-gradient(135deg, #f9a8d4, #fde68a)',
  'linear-gradient(135deg, #6ee7b7, #93c5fd)',
  'linear-gradient(135deg, #fca5a5, #f9a8d4)',
]

const initialMembers: Member[] = [
  {
    id: 1, name: 'Alice Chen', role: 'Lead', status: 'active',
    avatar: 'AC',
    tasks: ['Scope Guardian setup', 'Demo script', 'Judge Q&A prep'],
  },
  {
    id: 2, name: 'Bob Kumar', role: 'Backend', status: 'active',
    avatar: 'BK',
    tasks: ['MVP Backend API', 'Firebase setup', 'API endpoints'],
  },
  {
    id: 3, name: 'Charlie Park', role: 'Frontend', status: 'away',
    avatar: 'CP',
    tasks: ['UI Integration', 'Component polish', 'Mobile responsiveness'],
  },
]

const standupQuestions = [
  'What did you accomplish in the last checkpoint?',
  'What are you working on next?',
  'Any blockers or things the team needs to know?',
]

export default function TeamHub() {
  const [members, setMembers] = useLocalStorage<Member[]>('sp_teamMembers', initialMembers)
  const [showAdd, setShowAdd] = useState(false)
  const [showStandup, setShowStandup] = useState(false)
  const [form, setForm] = useState({ name: '', role: 'Frontend' as Role })
  const [newTask, setNewTask] = useState<Record<number, string>>({})
  const navigate = useNavigate()

  const addMember = () => {
    if (!form.name.trim()) return
    const initials = form.name.trim().split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    setMembers(m => [...m, {
      id: Date.now(), name: form.name.trim(), role: form.role,
      status: 'active', avatar: initials, tasks: [],
    }])
    setForm({ name: '', role: 'Frontend' })
    setShowAdd(false)
  }

  const addTask = (memberId: number) => {
    const t = newTask[memberId]?.trim()
    if (!t) return
    setMembers(m => m.map(x => x.id === memberId ? { ...x, tasks: [...x.tasks, t] } : x))
    setNewTask(prev => ({ ...prev, [memberId]: '' }))
  }

  const removeTask = (memberId: number, taskIdx: number) => {
    setMembers(m => m.map(x => x.id === memberId ? { ...x, tasks: x.tasks.filter((_, i) => i !== taskIdx) } : x))
  }

  const setStatus = (memberId: number, status: Status) => {
    setMembers(m => m.map(x => x.id === memberId ? { ...x, status } : x))
  }

  const removeMember = (id: number) => {
    setMembers(m => m.filter(x => x.id !== id))
  }

  const blockedCount = members.filter(m => m.status === 'blocked').length
  const totalTasks = members.reduce((acc, m) => acc + m.tasks.length, 0)

  return (
    <div className="fade-up" style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>◉ Team Hub</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>
            {members.length} members · {totalTasks} tasks in flight
            {blockedCount > 0 && <span style={{ color: 'var(--red)', marginLeft: 8 }}>· {blockedCount} blocked ⚠</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowStandup(true)}>
            ⏱ Standup
          </button>
          <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => setShowAdd(true)}>
            + Add Member
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Active', count: members.filter(m => m.status === 'active').length, color: 'var(--green)', icon: '●' },
          { label: 'Away', count: members.filter(m => m.status === 'away').length, color: 'var(--yellow)', icon: '●' },
          { label: 'Blocked', count: members.filter(m => m.status === 'blocked').length, color: 'var(--red)', icon: '⚠' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-surface)', border: `1px solid ${s.count > 0 && s.label === 'Blocked' ? 'rgba(252,165,165,0.2)' : 'var(--border)'}`,
            borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ color: s.color, fontSize: 18 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.count > 0 ? s.color : 'var(--text-muted)' }}>{s.count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Member cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {members.map((m, mi) => (
          <div key={m.id} className="card" style={{
            padding: 20,
            border: m.status === 'blocked' ? '1px solid rgba(252,165,165,0.3)' : '1px solid var(--border)',
          }}>
            {/* Member header */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: avatarColors[mi % avatarColors.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#060a08',
                }}>{m.avatar}</div>
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 12, height: 12, borderRadius: '50%',
                  background: statusMeta[m.status].dot,
                  border: '2px solid var(--bg-surface)',
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                    color: roleColors[m.role],
                    background: `color-mix(in srgb, ${roleColors[m.role]} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${roleColors[m.role]} 20%, transparent)`,
                  }}>{m.role}</span>
                  <span style={{ fontSize: 11, color: statusMeta[m.status].color }}>{statusMeta[m.status].label}</span>
                </div>
              </div>
              {/* Context menu */}
              <div style={{ display: 'flex', gap: 4 }}>
                {(['active', 'away', 'blocked'] as Status[]).filter(s => s !== m.status).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(m.id, s)}
                    title={`Set ${s}`}
                    style={{
                      width: 22, height: 22, borderRadius: 6, border: 'none',
                      background: `color-mix(in srgb, ${statusMeta[s].color} 12%, transparent)`,
                      color: statusMeta[s].color, fontSize: 8, fontWeight: 700, cursor: 'pointer',
                    }}
                  >{s[0].toUpperCase()}</button>
                ))}
                <button
                  onClick={() => removeMember(m.id)}
                  title="Remove member"
                  style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >×</button>
              </div>
            </div>

            {/* Tasks */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 8 }}>
                TASKS ({m.tasks.length})
              </div>
              {m.tasks.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>No tasks assigned</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {m.tasks.map((task, ti) => (
                    <div key={ti} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 10px', borderRadius: 7,
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12 }}>{task}</span>
                      <button
                        onClick={() => removeTask(m.id, ti)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', lineHeight: 1, padding: 0 }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add task */}
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                className="input"
                placeholder="Add task…"
                value={newTask[m.id] ?? ''}
                onChange={e => setNewTask(prev => ({ ...prev, [m.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addTask(m.id)}
                style={{ fontSize: 12, padding: '7px 10px' }}
              />
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 10px', flexShrink: 0 }} onClick={() => addTask(m.id)}>+</button>
            </div>
          </div>
        ))}

        {/* Add member card */}
        <div
          onClick={() => setShowAdd(true)}
          style={{
            background: 'var(--bg-surface)', border: '2px dashed var(--border)',
            borderRadius: 16, padding: 20, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 180, gap: 12, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--accent-dim)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)' }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '2px dashed var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: 'var(--text-muted)',
          }}>+</div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add team member</span>
        </div>
      </div>

      {/* Collaboration tips */}
      <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 12 }}>⚡ TEAM VELOCITY TIPS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { icon: '◈', tip: 'Sync every 4 hours — 15 min max', color: 'var(--accent)' },
            { icon: '◻', tip: 'One person per codebase layer', color: 'var(--blue)' },
            { icon: '◆', tip: 'Share blockers immediately, not at sync', color: 'var(--yellow)' },
            { icon: '◉', tip: 'Commit to Git every hour of coding', color: 'var(--green)' },
          ].map(t => (
            <div key={t.tip} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ color: t.color, flexShrink: 0, fontSize: 14 }}>{t.icon}</span>
              {t.tip}
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }} onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, width: 420, maxWidth: '90vw', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 20 }}>Add Team Member</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Name *</label>
                <input className="input" placeholder="e.g. Alice Chen" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} onKeyDown={e => e.key === 'Enter' && addMember()} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Role *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {roles.map(r => (
                    <button
                      key={r}
                      onClick={() => setForm({ ...form, role: r })}
                      style={{
                        padding: '6px 12px', borderRadius: 8,
                        border: `1px solid ${form.role === r ? roleColors[r] + '66' : 'var(--border)'}`,
                        background: form.role === r ? `color-mix(in srgb, ${roleColors[r]} 12%, transparent)` : 'transparent',
                        color: form.role === r ? roleColors[r] : 'var(--text-muted)',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >{r}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={addMember} disabled={!form.name.trim()}>Add Member</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standup Modal */}
      {showStandup && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }} onClick={e => e.target === e.currentTarget && setShowStandup(false)}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, width: 500, maxWidth: '90vw', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⏱</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Team Standup</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Keep it to 15 minutes max</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {standupQuestions.map((q, i) => (
                <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Q{i + 1}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{q}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 16px', background: 'rgba(167,139,250,0.05)', borderRadius: 10, border: '1px solid rgba(167,139,250,0.15)', marginBottom: 20, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              💡 Go around the room. Each person answers all 3 questions in 3 minutes or less. Blockers get addressed after — don't fix them during standup.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowStandup(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setShowStandup(false); navigate('/coach') }}>Ask AI Coach →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
