import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function QuickActions() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const actions = [
    { label: 'Ask AI Coach', icon: '◈', path: '/coach', color: 'var(--accent)' },
    { label: 'Log Decision', icon: '◷', path: '/journal', color: 'var(--accent2)' },
    { label: 'Add Feature', icon: '◻', path: '/scope', color: 'var(--blue)' },
    { label: 'Team Standup', icon: '⏱', path: '/team', color: 'var(--green)' },
  ]

  return (
    <div ref={menuRef} style={{ position: 'absolute', bottom: 32, right: 32, zIndex: 100 }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: 70, right: 0,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 8,
          display: 'flex', flexDirection: 'column', gap: 4,
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          minWidth: 180,
          animation: 'fadeUp 0.2s ease',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', padding: '8px 12px 4px', textTransform: 'uppercase' }}>
            Quick Actions
          </div>
          {actions.map(a => (
            <button
              key={a.label}
              onClick={() => { navigate(a.path); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                border: 'none', background: 'transparent',
                color: 'var(--text-primary)', fontSize: 13,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ color: a.color, fontSize: 16 }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          border: 'none', color: '#060a08', fontSize: 24,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px var(--accent-glow)',
          transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1)',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
      >
        +
      </button>
    </div>
  )
}
