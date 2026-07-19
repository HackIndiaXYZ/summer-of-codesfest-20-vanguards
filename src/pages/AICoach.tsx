import { useState, useRef, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useApp } from '../AppContext'
import { generateGeminiResponse } from '../utils/llm'

type Msg = { role: 'user' | 'ai'; text: string; timestamp: number }

const categories = [
  { label: 'Scope', icon: '◻', color: 'var(--accent)' },
  { label: 'Demo', icon: '◆', color: 'var(--yellow)' },
  { label: 'Team', icon: '◉', color: 'var(--blue)' },
  { label: 'Tech', icon: '◈', color: 'var(--green)' },
]

const starters = [
  { text: 'How do I prioritize my MVP features?', cat: 'Scope' },
  { text: 'Our demo is in 4 hours. What should I focus on?', cat: 'Demo' },
  { text: 'We have 3 developers. How do we split tasks?', cat: 'Team' },
  { text: 'Our backend keeps breaking. Should we simplify?', cat: 'Tech' },
  { text: "What's the fastest way to build a working prototype?", cat: 'Tech' },
  { text: 'How do I handle a missing team member mid-hackathon?', cat: 'Team' },
]

function formatTime(d: number) {
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Mock response generator removed in favor of real Gemini API

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:inherit;font-weight:700">$1</strong>')
    .replace(/^(\d+)\.\s/gm, '<span style="color:var(--accent);font-weight:700">$1.</span> ')
    .replace(/^- /gm, '<span style="color:var(--accent)">›</span> ')
}

export default function AICoach() {
  const { geminiApiKey } = useApp()
  const [messages, setMessages] = useLocalStorage<Msg[]>('sp_coachMsgs', [
    {
      role: 'ai',
      text: "I'm your **SprintPilot AI Coach** — think of me as a YC mentor in your corner.\n\nAsk me anything about scope, prioritization, team dynamics, or demo prep. What's blocking you right now?",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Msg = { role: 'user', text, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    
    try {
      const prompt = `You are a tough, experienced YC partner and hackathon coach. 
Give concise, highly tactical advice (max 150 words). Format your response using markdown with bold text and lists for emphasis.
If they are building a feature that isn't absolutely critical to demo value, tell them to cut it.
Be blunt but constructive.`
      
      const reply = await generateGeminiResponse(prompt, text)
      setMessages(prev => [...prev, { role: 'ai', text: reply, timestamp: Date.now() }])
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', text: `**Error:** ${err.message}`, timestamp: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  const filteredStarters = activeFilter
    ? starters.filter(s => s.cat === activeFilter)
    : starters

  const showStarters = messages.length < 2

  return (
    <div className="fade-up" style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>◈ AI Coach</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>
          Your on-demand startup mentor. Brutally honest, always on your side.
        </p>
      </div>

      {/* Category filters + starters */}
      {showStarters && (
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button
                key={c.label}
                onClick={() => setActiveFilter(activeFilter === c.label ? null : c.label)}
                style={{
                  padding: '5px 14px', borderRadius: 99, border: `1px solid ${activeFilter === c.label ? c.color + '66' : 'var(--border)'}`,
                  background: activeFilter === c.label ? `color-mix(in srgb, ${c.color} 10%, transparent)` : 'var(--bg-elevated)',
                  color: activeFilter === c.label ? c.color : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span>{c.icon}</span>{c.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {filteredStarters.map(s => (
              <button
                key={s.text}
                className="btn btn-ghost"
                style={{ fontSize: 12, textAlign: 'left' }}
                onClick={() => send(s.text)}
              >
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14,
        padding: '4px 0',
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            gap: 10,
            alignItems: 'flex-start',
          }}>
            {m.role === 'ai' && (
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: 'var(--accent-dim)', border: '1px solid rgba(167,139,250,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: 'var(--accent)', marginTop: 2,
              }}>⚡</div>
            )}
            <div style={{ maxWidth: '78%' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)',
                color: m.role === 'user' ? '#060a08' : 'var(--text-primary)',
                border: m.role === 'ai' ? '1px solid var(--border)' : 'none',
                fontSize: 13, lineHeight: 1.75,
                fontWeight: m.role === 'user' ? 500 : 400,
              }}>
                {m.text.split('\n').map((line, li) => (
                  <div key={li} style={{ marginBottom: line === '' ? 6 : 0 }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(line) }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                {formatTime(m.timestamp)}
              </div>
            </div>
            {m.role === 'user' && (
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#060a08', marginTop: 2,
              }}>A</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--accent-dim)', border: '1px solid rgba(167,139,250,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: 'var(--accent)',
            }}>⚡</div>
            <div style={{ display: 'flex', gap: 4, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: '14px 14px 14px 4px', border: '1px solid var(--border)', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>Thinking…</span>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)',
                  animation: `pulse-dot 1.2s ${i * 0.2}s ease-in-out infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, marginTop: 12, flexShrink: 0 }}>
        <textarea
          className="textarea"
          rows={2}
          placeholder="Ask your AI coach anything…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          style={{ flex: 1 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            className="btn btn-primary"
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            style={{ flex: 1 }}
          >
            Send ↑
          </button>
          <button
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: '4px 10px', justifyContent: 'center' }}
            onClick={() => setMessages([messages[0]])}
            title="Clear chat"
          >
            Clear
          </button>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
        ↵ Enter to send · Shift+↵ for new line
      </div>
    </div>
  )
}
