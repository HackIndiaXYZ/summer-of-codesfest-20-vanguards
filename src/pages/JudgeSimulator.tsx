import { useState, useRef, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useApp } from '../AppContext'
import { generateGeminiResponse } from '../utils/llm'

type Msg = { role: 'user' | 'judge'; text: string; score?: number }

type JudgePersona = {
  name: string
  title: string
  style: string
  color: string
  icon: string
  openingLine: string
}

const personas: JudgePersona[] = [
  {
    name: 'Judge Chen',
    title: 'Partner @ YC · 200+ startups evaluated',
    style: 'Notoriously blunt',
    color: '#ef4444',
    icon: '⚖',
    openingLine: '*[Looks up from laptop]* Alright, you have 30 seconds. What did you build and why should I care?',
  },
  {
    name: 'Dr. Patel',
    title: 'Head of Innovation @ Google · Ex-Googler',
    style: 'Technical depth seeker',
    color: '#3b82f6',
    icon: '🔬',
    openingLine: 'Walk me through the technical architecture. I want to understand the hard problems you solved, not the surface-level features.',
  },
  {
    name: 'Sarah Kim',
    title: 'VC Partner @ a16z · Product-obsessed',
    style: 'User experience focused',
    color: '#a855f7',
    icon: '✦',
    openingLine: "I'm going to roleplay as your user. Pretend I just opened your app for the first time. What do I see, what do I click, and what problem does that solve for me — without you explaining anything?",
  },
]

// Mock responses removed in favor of real Gemini API

function scoreResponse(msg: string): number {
  const words = msg.split(' ').length
  let score = 40
  if (words > 20) score += 10
  if (words > 40) score += 10
  if (/\d/.test(msg)) score += 15 // has numbers = good
  if (/because|since|therefore|result/i.test(msg)) score += 10 // has reasoning
  if (/user|customer|problem/i.test(msg)) score += 10 // user-focused
  if (words > 80) score -= 10 // too long
  return Math.min(score, 95)
}

export default function JudgeSimulator() {
  const { geminiApiKey } = useApp()
  const [selectedPersona, setSelectedPersona] = useLocalStorage('sp_judgePersona', 0)
  const persona = personas[selectedPersona]

  const [messages, setMessages] = useLocalStorage<Msg[]>('sp_judgeMsgs', [
    { role: 'judge', text: persona.openingLine }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionScore, setSessionScore] = useLocalStorage<number | null>('sp_judgeScore', null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const score = scoreResponse(input)
    const m: Msg = { role: 'user', text: input, score }
    setMessages(p => [...p, m])
    setInput('')
    setLoading(true)
    
    try {
      const prompt = `You are a hackathon judge. 
Your name: ${persona.name}. Your title: ${persona.title}. Your style: ${persona.style}.
You are evaluating a team's pitch/app. Respond to the user's message in character.
Be incredibly concise (max 75 words). Ask tough, pointed questions.
Format your response using markdown.`
      
      const reply = await generateGeminiResponse(prompt, input)
      setMessages(p => [...p, { role: 'judge', text: reply }])
      
      const userMsgs = messages.filter(x => x.role === 'user')
      const allScores = [...userMsgs.map(x => x.score ?? 50), score]
      setSessionScore(Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length))
    } catch (err: any) {
      setMessages(p => [...p, { role: 'judge', text: `**System Error:** ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const reset = (p: number) => {
    setSelectedPersona(p)
    setMessages([{ role: 'judge', text: personas[p].openingLine }])
    setSessionScore(null)
  }

  const scoreColor = (s: number) => s >= 70 ? 'var(--green)' : s >= 50 ? 'var(--yellow)' : 'var(--red)'
  const scoreLabel = (s: number) => s >= 70 ? 'Strong pitch' : s >= 50 ? 'Needs work' : 'Weak pitch'

  return (
    <div className="fade-up" style={{ maxWidth: 760, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>◆ Judge Simulator</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>
          Practice your pitch against a brutally honest YC-style judge. No softballs.
        </p>
      </div>

      {/* Persona selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {personas.map((p, i) => (
          <button
            key={p.name}
            onClick={() => reset(i)}
            style={{
              padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
              background: selectedPersona === i ? `color-mix(in srgb, ${p.color} 8%, var(--bg-surface))` : 'var(--bg-surface)',
              border: `1px solid ${selectedPersona === i ? p.color + '44' : 'var(--border)'}`,
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 6 }}>{p.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: selectedPersona === i ? p.color : 'var(--text-primary)', marginBottom: 2 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.style}</div>
          </button>
        ))}
      </div>

      {/* Judge card */}
      <div style={{
        display: 'flex', gap: 14, alignItems: 'center',
        padding: '14px 18px', marginBottom: 16,
        background: 'var(--bg-elevated)', borderRadius: 12,
        border: `1px solid ${persona.color}22`,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${persona.color}, ${persona.color}88)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>{persona.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{persona.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{persona.title}</div>
        </div>
        {sessionScore !== null && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: scoreColor(sessionScore) }}>
              {sessionScore}
            </div>
            <div style={{ fontSize: 10, color: scoreColor(sessionScore) }}>{scoreLabel(sessionScore)}</div>
          </div>
        )}
        <span className="badge badge-red" style={{ marginLeft: sessionScore ? 0 : 'auto' }}>Live Session</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 240, overflowY: 'auto', paddingBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
            gap: 10, alignItems: 'flex-start',
          }}>
            {m.role === 'judge' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${persona.color}, ${persona.color}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, marginTop: 2,
              }}>{persona.icon}</div>
            )}
            <div style={{ maxWidth: '75%' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)',
                color: m.role === 'user' ? '#060a08' : 'var(--text-primary)',
                border: m.role === 'judge' ? `1px solid ${persona.color}22` : 'none',
                fontSize: 13, lineHeight: 1.7,
                fontWeight: m.role === 'user' ? 500 : 400,
              }}>
                <span dangerouslySetInnerHTML={{
                  __html: m.text.replace(/\*(.+?)\*/g, `<em style="color:${persona.color};font-style:italic">$1</em>`)
                }} />
              </div>
              {m.role === 'user' && m.score !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 5, gap: 6, alignItems: 'center' }}>
                  <div style={{ height: 4, width: 60, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.score}%`, background: scoreColor(m.score), borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: 10, color: scoreColor(m.score), fontFamily: 'var(--font-mono)' }}>{m.score}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${persona.color}, ${persona.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{persona.icon}</div>
            <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: '14px 14px 14px 4px', border: `1px solid ${persona.color}22`, display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>Thinking…</span>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: persona.color, animation: `pulse-dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <input
          className="input"
          placeholder="Defend your project…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 18px', borderRadius: 'var(--radius)', border: 'none',
            background: `linear-gradient(135deg, ${persona.color}, ${persona.color}cc)`,
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            opacity: loading || !input.trim() ? 0.4 : 1, transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >Pitch ↑</button>
      </div>

      {/* Tips */}
      <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.06em' }}>💡 PITCH TIPS</div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {['Lead with the problem, not your solution', 'Always have a number ready', 'Practice your one-liner 10x'].map(tip => (
            <div key={tip} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 6 }}>
              <span style={{ color: 'var(--accent)' }}>›</span>{tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
