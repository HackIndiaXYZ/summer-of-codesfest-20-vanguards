import { NavLink } from 'react-router-dom'
import { useApp } from '../AppContext'

type NavItem = {
  to: string
  icon: string
  label: string
  badge?: string
  badgeColor?: string
}

const nav: NavItem[] = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/coach',     icon: '◈', label: 'AI Coach',     badge: 'AI',    badgeColor: 'var(--accent)' },
  { to: '/problem',   icon: '◎', label: 'Problem Check' },
  { to: '/scope',     icon: '◻', label: 'Scope Guard' },
  { to: '/team',      icon: '◉', label: 'Team Hub' },
  { to: '/judge',     icon: '◆', label: 'Judge Sim',    badge: 'LIVE',  badgeColor: 'var(--red)' },
  { to: '/journal',   icon: '◷', label: 'Decision Log' },
  { to: '/roadmap',   icon: '⊕', label: 'Roadmap',      badge: 'Ph 5',  badgeColor: 'var(--yellow)' },
]

// Simulated completion state (in a real app this would be from global state)
const pageStatus: Record<string, 'done' | 'active' | 'pending'> = {
  '/dashboard': 'active',
  '/problem':   'done',
  '/scope':     'active',
  '/team':      'active',
  '/coach':     'active',
  '/judge':     'pending',
  '/journal':   'active',
  '/roadmap':   'active',
}

const statusDot: Record<string, string> = {
  done:    'var(--green)',
  active:  'var(--accent)',
  pending: 'var(--border)',
}

export default function Sidebar({ open }: { open: boolean }) {
  const { teamName, currentPhase, totalPhases } = useApp()
  const phasePct = Math.round((currentPhase / totalPhases) * 100)

  return (
    <aside style={{
      width: open ? '220px' : '0',
      minWidth: open ? '220px' : '0',
      overflow: 'hidden',
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 20,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border)',
        whiteSpace: 'nowrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: 'var(--accent)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17,
            boxShadow: '0 0 20px var(--accent-glow)',
            flexShrink: 0,
          }}>⚡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>SprintPilot</div>
            <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginTop: 1 }}>AI · HACKATHON</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 10px 8px' }}>
          Tools
        </div>
        {nav.map(({ to, icon, label, badge, badgeColor }) => {
          const status = pageStatus[to] ?? 'pending'
          return (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                marginBottom: 2,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
                border: isActive ? '1px solid rgba(167,139,250,0.2)' : '1px solid transparent',
                position: 'relative',
              })}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                if (!el.classList.contains('active')) {
                  el.style.background = 'var(--bg-elevated)'
                  el.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                if (!el.classList.contains('active')) {
                  el.style.background = 'transparent'
                  el.style.color = 'var(--text-secondary)'
                }
              }}
            >
              {/* Status dot */}
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: statusDot[status],
                flexShrink: 0,
                boxShadow: status === 'active' ? '0 0 6px var(--accent-glow)' : 'none',
                transition: 'all 0.2s',
              }} />

              <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>

              {badge && (
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                  color: badgeColor,
                  background: `color-mix(in srgb, ${badgeColor} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${badgeColor} 25%, transparent)`,
                  padding: '1px 5px', borderRadius: 4, flexShrink: 0,
                }}>{badge}</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Sprint phase indicator */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>
          SPRINT PROGRESS
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Phase {currentPhase} of {totalPhases}</span>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{phasePct}%</span>
        </div>
        <div className="progress-bar" style={{ height: 4, marginBottom: 12 }}>
          <div className="progress-fill" style={{ width: `${phasePct}%` }} />
        </div>

        {/* Team info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#060a08', flexShrink: 0,
          }}>S</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{teamName}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>3 members · Active</div>
          </div>
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <div className="pulse-dot" />
          </div>
        </div>
      </div>
    </aside>
  )
}
