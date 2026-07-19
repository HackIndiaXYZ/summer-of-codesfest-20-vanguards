import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../AppContext'

type Notification = {
  id: number
  text: string
  type: 'warning' | 'info' | 'success'
  time: string
  read: boolean
}

// Notifications will be initialized inside component

const notifColors = {
  warning: 'var(--yellow)',
  info: 'var(--accent)',
  success: 'var(--green)',
}

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { hackathonName, setHackathonName, teamName, setTeamName, currentPhase } = useApp()
  const [seconds, setSeconds] = useState(86400)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, text: 'Scope creep detected — 3 new "Nice to Have" items added', type: 'warning', time: '12m', read: false },
    { id: 2, text: `Phase ${currentPhase} (Scope Guardian) is now active`, type: 'info', time: '1h', read: false },
    { id: 3, text: 'Problem Reality Check completed ✓', type: 'success', time: '3h', read: true },
  ])
  const notifsRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 0), 1000)
    return () => clearInterval(t)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false)
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  const urgent = seconds < 3600
  const unread = notifications.filter(n => !n.read).length

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })))
  const dismissNotif = (id: number) => setNotifications(n => n.filter(x => x.id !== id))

  const pct = Math.round((1 - seconds / 86400) * 100)

  return (
    <header style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
      gap: 16,
      position: 'relative',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onMenuClick}
          style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            fontSize: 16, padding: '6px', borderRadius: 6, display: 'flex', cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >☰</button>
        <div style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          {hackathonName} · <span style={{ color: 'var(--accent)' }}>Active</span>
        </div>
      </div>

      {/* Center — countdown with mini progress */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: urgent ? 'rgba(252,165,165,0.08)' : 'var(--bg-elevated)',
        border: `1px solid ${urgent ? 'rgba(252,165,165,0.3)' : 'var(--border)'}`,
        borderRadius: 10,
        padding: '6px 14px',
        transition: 'all 0.3s',
      }}>
        <span style={{ fontSize: 10, color: urgent ? 'var(--red)' : 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>
          {urgent ? '🔴' : '⏱'} TIME LEFT
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 15,
          fontWeight: 700,
          color: urgent ? 'var(--red)' : 'var(--accent)',
          letterSpacing: '0.05em',
        }}>
          {h}:{m}:{s}
        </span>
        {/* Thin timeline bar */}
        <div style={{ width: 60, height: 3, background: 'var(--bg-base)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: urgent ? 'var(--red)' : 'linear-gradient(90deg, var(--accent), var(--accent2))',
            borderRadius: 99, transition: 'width 1s ease',
          }} />
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="badge badge-green" style={{ fontSize: 11 }}>✓ Build passing</span>

        {/* Notifications bell */}
        <div ref={notifsRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowSettings(false) }}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
              background: showNotifs ? 'var(--bg-elevated)' : 'transparent',
              color: 'var(--text-secondary)', fontSize: 15, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', transition: 'all 0.15s',
            }}
          >
            🔔
            {unread > 0 && (
              <div style={{
                position: 'absolute', top: 2, right: 2,
                width: 14, height: 14, borderRadius: '50%',
                background: 'var(--red)', color: '#fff',
                fontSize: 8, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid var(--bg-surface)',
              }}>{unread}</div>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', top: 40, right: 0,
              width: 320, background: 'var(--bg-surface)',
              border: '1px solid var(--border)', borderRadius: 14,
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
              zIndex: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications</span>
                {unread > 0 && (
                  <button className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 8px' }} onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  All caught up! 🎉
                </div>
              ) : (
                <div>
                  {notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      background: n.read ? 'transparent' : 'rgba(167,139,250,0.03)',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: notifColors[n.type], marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, lineHeight: 1.5, color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.text}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>{n.time} ago</div>
                      </div>
                      <button
                        onClick={() => dismissNotif(n.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', lineHeight: 1, padding: 0, flexShrink: 0 }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings */}
        <div ref={settingsRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowSettings(!showSettings); setShowNotifs(false) }}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
              background: showSettings ? 'var(--bg-elevated)' : 'transparent',
              color: 'var(--text-secondary)', fontSize: 15, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >⚙</button>

          {showSettings && (
            <div style={{
              position: 'absolute', top: 40, right: 0,
              width: 280, background: 'var(--bg-surface)',
              border: '1px solid var(--border)', borderRadius: 14,
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
              zIndex: 200, padding: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Quick Settings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Hackathon Name</label>
                  <input
                    className="input"
                    value={hackathonName}
                    onChange={e => setHackathonName(e.target.value)}
                    style={{ fontSize: 12, padding: '7px 10px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Team Name</label>
                  <input
                    className="input"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    style={{ fontSize: 12, padding: '7px 10px' }}
                  />
                </div>
                <div style={{ paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10, letterSpacing: '0.06em' }}>QUICK NAVIGATION</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { label: 'Team Hub', path: '/team' },
                      { label: 'Roadmap', path: '/roadmap' },
                      { label: 'AI Coach', path: '/coach' },
                      { label: 'Decision Log', path: '/journal' },
                    ].map(link => (
                      <button
                        key={link.path}
                        className="btn btn-ghost"
                        style={{ fontSize: 11, justifyContent: 'center' }}
                        onClick={() => { navigate(link.path); setShowSettings(false) }}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#060a08', cursor: 'pointer',
          }}
          onClick={() => navigate('/team')}
          title="Team Hub"
        >A</div>
      </div>
    </header>
  )
}
