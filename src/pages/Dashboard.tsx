import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../AppContext'

// Metrics will be generated inside the component to use context

type InsightType = 'warning' | 'info' | 'success'

const insights = [
  {
    type: 'warning' as InsightType,
    icon: '⚠',
    title: 'Scope Creep Detected',
    body: 'You added 3 features to "Nice to Have" while still at 47% core progress. Freeze scope now.',
    time: '12 min ago',
    action: '/scope',
    actionLabel: 'Go to Scope Guard',
  },
  {
    type: 'info' as InsightType,
    icon: '◈',
    title: 'Demo Tip',
    body: 'Record a fallback video by Hour 20. Live demos fail 30% of the time due to network issues.',
    time: '1 hr ago',
    action: '/coach',
    actionLabel: 'Ask AI Coach',
  },
  {
    type: 'success' as InsightType,
    icon: '✓',
    title: 'Problem Validated',
    body: 'You\'ve completed all 5 problem reality check questions. Strong foundation!',
    time: '3 hr ago',
    action: '/problem',
    actionLabel: 'Review Answers',
  },
]

const tasks = [
  { title: 'MVP Backend API',   assignee: 'Bob',     due: 'in 2 hrs',  urgency: 'high' },
  { title: 'UI Integration',    assignee: 'Charlie',  due: 'in 5 hrs',  urgency: 'medium' },
  { title: 'Demo Script',       assignee: 'Alice',    due: 'in 8 hrs',  urgency: 'medium' },
  { title: 'Final Code Freeze', assignee: 'All',      due: 'in 12 hrs', urgency: 'low' },
]

const urgencyColor: Record<string, string> = {
  high: 'var(--red)',
  medium: 'var(--yellow)',
  low: 'var(--green)',
}

const insightColors: Record<InsightType, { bg: string; border: string; iconColor: string }> = {
  warning: { bg: 'rgba(253,230,138,0.05)', border: 'rgba(253,230,138,0.15)', iconColor: 'var(--yellow)' },
  info:    { bg: 'var(--bg-elevated)',      border: 'var(--border)',           iconColor: 'var(--accent)' },
  success: { bg: 'rgba(134,239,172,0.05)', border: 'rgba(134,239,172,0.15)', iconColor: 'var(--green)' },
}

export default function Dashboard() {
  const { hackathonName, teamName, currentPhase, totalPhases, overallProgress, problemCheckDone } = useApp()
  const [dismissedInsights, setDismissedInsights] = useState<Set<number>>(new Set())
  const navigate = useNavigate()

  const metrics = [
    { label: 'Overall Progress', value: `${overallProgress}%`, sub: '↑ 12% from last check', bar: overallProgress, color: 'var(--accent)', icon: '◈' },
    { label: 'Demo Readiness',   value: '31%', sub: 'Needs attention',        bar: 31, color: 'var(--yellow)', icon: '◎' },
    { label: 'Risk Level',       value: 'LOW', sub: 'Velocity is healthy',    bar: null, color: 'var(--green)', icon: '◆', badge: 'badge-green' },
    { label: 'Tasks Complete',   value: '9/21', sub: '4 blocked · 8 in progress', bar: 43, color: 'var(--accent2)', icon: '◉' },
  ]

  const visibleInsights = insights.filter((_, i) => !dismissedInsights.has(i))

  return (
    <div className="fade-up" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Mission Control
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 13 }}>
              {hackathonName} · {teamName} · <span style={{ color: 'var(--accent)' }}>Phase {currentPhase} of {totalPhases}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/journal')}>
              + Log Decision
            </button>
            <div className="badge badge-accent" style={{ fontSize: 12 }}>
              <span className="pulse-dot" style={{ width: 6, height: 6 }} />
              Live session
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid — 4 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {metrics.map((m, i) => (
          <div key={i} className="metric-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {m.label}
              </div>
              <div style={{
                width: 26, height: 26, borderRadius: 6,
                background: `color-mix(in srgb, ${m.color} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${m.color} 20%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: m.color,
              }}>{m.icon}</div>
            </div>
            {m.badge ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: m.color }}>
                  {m.value}
                </span>
                <span className={`badge ${m.badge}`} style={{ fontSize: 10 }}>{m.value}</span>
              </div>
            ) : (
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: m.color, marginBottom: 10 }}>
                {m.value}
              </div>
            )}
            {m.bar != null && (
              <div style={{ marginBottom: 8 }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${m.bar}%`, background: `linear-gradient(90deg, ${m.color}, ${m.color}88)` }} />
                </div>
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* AI Insights */}
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">◈ AI Insights</div>
              <div className="section-sub">Powered by Gemini 2.0 Flash</div>
            </div>
            <span className="badge badge-accent">Live</span>
          </div>
          {visibleInsights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              ✓ All insights reviewed
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {insights.map((ins, i) => {
                if (dismissedInsights.has(i)) return null
                const c = insightColors[ins.type]
                return (
                  <div key={i} style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    transition: 'opacity 0.2s',
                  }}>
                    <span style={{ fontSize: 16, color: c.iconColor, lineHeight: 1, marginTop: 2 }}>{ins.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{ins.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{ins.body}</div>
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: 11, padding: '4px 10px', height: 26 }}
                        onClick={() => navigate(ins.action)}
                      >
                        {ins.actionLabel} →
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{ins.time}</span>
                      <button
                        onClick={() => setDismissedInsights(prev => new Set([...prev, i]))}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', lineHeight: 1 }}
                        title="Dismiss"
                      >×</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Task Timeline */}
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">◷ Deadlines</div>
              <div className="section-sub">Upcoming milestones</div>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>+ Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                background: 'var(--bg-elevated)',
                borderRadius: 8,
                border: '1px solid var(--border)',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: urgencyColor[t.urgency],
                  boxShadow: `0 0 6px ${urgencyColor[t.urgency]}66`,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.assignee}</div>
                </div>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {t.due}
                </span>
              </div>
            ))}
          </div>

          {/* Sprint progress */}
          <div style={{ marginTop: 16, padding: '14px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
              <span>Sprint Progress</span><span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>47%</span>
            </div>
            <div className="progress-bar" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: '47%' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>
              <span>Hour 0</span><span>Hour 12</span><span>Hour 24</span>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button className="btn btn-ghost" style={{ fontSize: 11, justifyContent: 'center' }} onClick={() => navigate('/coach')}>
              ◈ AI Coach
            </button>
            <button className="btn btn-ghost" style={{ fontSize: 11, justifyContent: 'center' }} onClick={() => navigate('/roadmap')}>
              ◉ Roadmap
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
