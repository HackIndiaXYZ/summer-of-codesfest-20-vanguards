import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Status = 'done' | 'active' | 'pending' | 'skipped'

type Phase = {
  id: number
  name: string
  status: Status
  time: string
  owner: string
  description: string
  tips: string[]
}

const initialPhases: Phase[] = [
  { id: 1,  name: 'Team Formation',        status: 'done',    time: 'Hr 0–1',   owner: 'Alice',        description: 'Set up team communication, assign roles, and agree on working norms.',    tips: ['Use Discord or Slack for instant comms', 'Assign a "decision maker" role upfront', 'Do a 5-min skills audit'] },
  { id: 2,  name: 'Hackathon Intelligence', status: 'done',    time: 'Hr 1–2',   owner: 'Alice',        description: 'Understand judging criteria, theme constraints, and prize categories.',     tips: ['Read the judging rubric 3 times', 'Note which criteria are weighted most', 'Find last year\'s winning projects'] },
  { id: 3,  name: 'Problem Reality Check',  status: 'done',    time: 'Hr 2–3',   owner: 'All',          description: 'Validate that your problem is real, painful, and solvable in 24 hours.',   tips: ['Complete the 5-question reality check', 'Interview at least 2 potential users', 'Define who specifically has this problem'] },
  { id: 4,  name: 'Pioneer Research',       status: 'done',    time: 'Hr 3–4',   owner: 'Charlie',      description: 'Survey the competitive landscape and identify your unique angle.',          tips: ['Search Product Hunt for direct competitors', 'Identify what they do NOT solve', 'Define your 10x differentiator'] },
  { id: 5,  name: 'Scope Guardian',         status: 'active',  time: 'Hr 4–5',   owner: 'Alice',        description: 'Lock the feature set using MoSCoW. No scope changes after this phase.',    tips: ['Fill in all 4 MoSCoW buckets', 'Must-Haves should take max 60% of time', 'Print and stick the scope on a wall'] },
  { id: 6,  name: 'Architecture Design',    status: 'pending', time: 'Hr 5–6',   owner: 'Bob',          description: 'Design the system: data model, API contracts, and tech stack.',             tips: ['Keep it as simple as possible', 'Use managed services for auth/db', 'Draw the architecture in 1 diagram'] },
  { id: 7,  name: 'Roadmap Planning',       status: 'pending', time: 'Hr 6–7',   owner: 'Alice',        description: 'Break down tasks, estimate time, and create the sprint plan.',              tips: ['Time-box every task to 2h max', 'Have a "fast path" and "full path" plan', 'Identify the single riskiest assumption'] },
  { id: 8,  name: 'Task Distribution',      status: 'pending', time: 'Hr 7–8',   owner: 'All',          description: 'Assign tasks by layer. No two people on the same file.',                  tips: ['One dev per layer (front/back/integration)', 'Set check-in reminders every 4 hours', 'Define "done" for each task clearly'] },
  { id: 9,  name: 'Execution Sprint',       status: 'pending', time: 'Hr 8–18',  owner: 'Bob+Charlie',  description: '10-hour heads-down build phase. Ship working software.',                   tips: ['No new features', 'Fix blockers immediately', 'Commit to Git every hour'] },
  { id: 10, name: 'Decision Journal',       status: 'pending', time: 'Hr 8–18',  owner: 'All',          description: 'Log every major decision with rationale during the build.',               tips: ['Log every cut feature', 'Record tech choices made', 'This becomes your pitch story'] },
  { id: 11, name: 'Continuous Coaching',    status: 'pending', time: 'Hr 8–18',  owner: 'AI',           description: 'Use the AI coach to unblock decisions, manage morale, and adapt.',        tips: ['Check in every 4 hours', 'Ask about scope if stuck', 'Use Judge Sim for early pitch practice'] },
  { id: 12, name: 'Demo Readiness',         status: 'pending', time: 'Hr 18–22', owner: 'All',          description: 'Polish the demo path. Record fallback video. Freeze all code.',            tips: ['Record a 90-second fallback video', 'Test on the judge\'s device/browser', 'Rehearse the demo 5 times minimum'] },
  { id: 13, name: 'Judge Simulator',        status: 'pending', time: 'Hr 22–23', owner: 'Alice',        description: 'Practice your pitch under pressure with the AI judge.',                   tips: ['Answer "why now?" confidently', 'Have numbers ready (users, time saved)', 'Practice transitions between slides'] },
  { id: 14, name: 'Final Submission',       status: 'pending', time: 'Hr 23–24', owner: 'All',          description: 'Submit the project, fill in the form, and prepare for Q&A.',             tips: ['Submit 30 min early', 'Double-check the demo link works', 'Prepare 3-min and 1-min pitch versions'] },
]

const statusStyle: Record<Status, { color: string; bg: string; icon: string; border: string }> = {
  done:    { color: 'var(--green)',       bg: 'rgba(134,239,172,0.1)', icon: '✓', border: 'rgba(134,239,172,0.2)' },
  active:  { color: 'var(--accent)',      bg: 'var(--accent-dim)',     icon: '▶', border: 'rgba(167,139,250,0.3)' },
  pending: { color: 'var(--text-muted)',  bg: 'var(--bg-elevated)',    icon: '○', border: 'var(--border)' },
  skipped: { color: 'var(--orange)',      bg: 'rgba(253,186,116,0.1)', icon: '⟩', border: 'rgba(253,186,116,0.2)' },
}

export default function PhaseRoadmap() {
  const [phases, setPhases] = useLocalStorage<Phase[]>('sp_roadmapPhases', initialPhases)
  const [expanded, setExpanded] = useState<number | null>(5)
  const [showAll, setShowAll] = useState(false)

  const done    = phases.filter(p => p.status === 'done').length
  const active  = phases.filter(p => p.status === 'active')
  const pct     = Math.round((done / phases.length) * 100)

  const markDone = (id: number) => {
    setPhases(prev => {
      const idx = prev.findIndex(p => p.id === id)
      const updated = prev.map((p, i) => {
        if (p.id === id) return { ...p, status: 'done' as Status }
        if (i === idx + 1 && prev[i].status === 'pending') return { ...p, status: 'active' as Status }
        return p
      })
      return updated
    })
  }

  const displayedPhases = showAll ? phases : phases.filter(p => p.status !== 'pending' || phases.indexOf(p) <= (phases.findIndex(p => p.status === 'active') + 2))

  return (
    <div className="fade-up" style={{ maxWidth: 800 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>◉ Phase Roadmap</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>
          14 phases to hackathon victory. You're on Phase {active[0]?.id ?? 1}.
        </p>
      </div>

      {/* Progress summary */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{done} of {phases.length} phases complete</span>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{pct}%</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--text-muted)' }}>
              <span>Start</span>
              <span>Midpoint</span>
              <span>Submission</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
            {(['done', 'active', 'pending', 'skipped'] as Status[]).map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusStyle[s].color }} />
                <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {phases.map((ph) => {
          const s = statusStyle[ph.status]
          const isExpanded = expanded === ph.id
          const isActive = ph.status === 'active'
          const isDone = ph.status === 'done'

          return (
            <div key={ph.id}>
              <div
                onClick={() => setExpanded(isExpanded ? null : ph.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 18px', borderRadius: isExpanded ? '10px 10px 0 0' : 10,
                  background: isActive ? 'var(--accent-dim)' : 'var(--bg-surface)',
                  border: `1px solid ${isActive ? 'rgba(167,139,250,0.25)' : isExpanded ? 'var(--border-bright)' : 'var(--border)'}`,
                  borderBottom: isExpanded ? 'none' : undefined,
                  transition: 'all 0.2s', cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {/* Status icon */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: s.bg, color: s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, border: `1px solid ${s.border}`,
                }}>{s.icon}</div>

                {/* Phase number */}
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: 20, flexShrink: 0 }}>
                  {String(ph.id).padStart(2, '0')}
                </div>

                {/* Name */}
                <div style={{ flex: 1, fontWeight: isActive ? 700 : isDone ? 500 : 400, fontSize: 13, color: ph.status === 'pending' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                  {ph.name}
                  {isActive && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>← CURRENT</span>}
                </div>

                {/* Time */}
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', flexShrink: 0 }}>{ph.time}</div>

                {/* Owner */}
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0, width: 90, textAlign: 'right' }}>{ph.owner}</div>

                {/* Expand arrow */}
                <div style={{ color: 'var(--text-muted)', fontSize: 10, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                  ▾
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{
                  padding: '16px 18px 18px',
                  background: isActive ? 'rgba(167,139,250,0.03)' : 'var(--bg-surface)',
                  border: `1px solid ${isActive ? 'rgba(167,139,250,0.25)' : 'var(--border-bright)'}`,
                  borderTop: 'none', borderRadius: '0 0 10px 10px',
                  marginBottom: 2,
                }}>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.7 }}>
                    {ph.description}
                  </p>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.06em' }}>TIPS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    {ph.tips.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent)', flexShrink: 0 }}>›</span>
                        {tip}
                      </div>
                    ))}
                  </div>
                  {isActive && (
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 12 }}
                      onClick={(e) => { e.stopPropagation(); markDone(ph.id); setExpanded(null) }}
                    >
                      ✓ Mark Phase Complete
                    </button>
                  )}
                  {isDone && (
                    <span className="badge badge-green">✓ Completed</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Show all toggle */}
      <button
        className="btn btn-ghost"
        style={{ width: '100%', marginTop: 14, justifyContent: 'center', fontSize: 12 }}
        onClick={() => setShowAll(!showAll)}
      >
        {showAll ? '↑ Show Less' : `↓ Show All ${phases.length} Phases`}
      </button>
    </div>
  )
}
