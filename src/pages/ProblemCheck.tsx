import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../AppContext'
import { generateGeminiResponse } from '../utils/llm'

type Step = {
  id: number
  title: string
  placeholder: string
  coachQuestion: string
  pushback: string[]
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Who exactly has this problem?',
    placeholder: 'Describe the specific persona — not just "everyone".\ne.g. "Final-year CS students who join 3+ hackathons per year and lose hours on logistics instead of building."',
    coachQuestion: 'Who EXACTLY is your user? Be specific enough that you could find 10 of them on LinkedIn right now.',
    pushback: [
      '"Students" is too broad — which students? What year, major, context?',
      'Good start — now add: how frequently do they encounter this problem?',
      'Strong persona! Can you identify 3 real people who fit this description?',
    ],
  },
  {
    id: 2,
    title: 'How do they currently solve it?',
    placeholder: 'What manual workaround, tool, or competitor do they use today?\ne.g. "They use a mix of Notion, WhatsApp, and spreadsheets — 3 separate tools."',
    coachQuestion: 'What do people do RIGHT NOW when they face this problem? No competitor = no problem.',
    pushback: [
      '"Nothing" is a red flag — if there\'s no workaround, is the pain real enough?',
      'Good — now quantify the cost: time wasted, money lost, or frustration level?',
      'Strong answer. Your differentiator needs to be 10x better than this, not just slightly better.',
    ],
  },
  {
    id: 3,
    title: 'Why is the current solution insufficient?',
    placeholder: 'Is it too slow, too expensive, requires too much setup, or fundamentally broken?\ne.g. "3 separate tools = 40% time wasted on coordination, no single source of truth."',
    coachQuestion: 'What specifically breaks about the existing solutions? "Better UX" is not a valid answer without a concrete failure mode.',
    pushback: [
      '"Better design" isn\'t a business reason — what does the user FAIL to accomplish today?',
      'Good framing. Speed is valid — can you quantify it? "10x faster" beats "faster".',
      'Excellent. That\'s a real gap. Make sure your MVP actually closes this specific gap.',
    ],
  },
  {
    id: 4,
    title: 'What assumptions are you making?',
    placeholder: 'List 3 assumptions your idea depends on being true.\ne.g. "1. Users will share data publicly. 2. Teams of 3+ people have this coordination problem. 3. People will pay $X/mo."',
    coachQuestion: 'What are the 3 assumptions that, if wrong, would kill your entire project? Rank them by risk.',
    pushback: [
      'Your riskiest assumption is the one you\'re most emotionally attached to — be honest.',
      'Good list. Which one would you test first if you had 2 hours?',
      'Strong self-awareness. Knowing your risky assumptions means you can de-risk them.',
    ],
  },
  {
    id: 5,
    title: 'What evidence supports your idea?',
    placeholder: 'Have you talked to users? Found research? Or is it just a gut feeling?\ne.g. "Interviewed 4 hackathon participants in the last hour. All described the same coordination problem."',
    coachQuestion: 'What evidence — not intuition — supports that this problem is real and urgent?',
    pushback: [
      'Gut feeling alone won\'t win judges. Even 5 quick interviews in 2 hours changes everything.',
      'Good start — can you find one published stat or report that backs this up?',
      'Excellent evidence base! Cite this explicitly in your pitch.',
    ],
  },
]

export default function ProblemCheck() {
  const { setProblemCheckDone, setProblemAnswers: setGlobalAnswers, geminiApiKey } = useApp()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(''))
  const [submitted, setSubmitted] = useState<boolean[]>(Array(5).fill(false))
  const [pushbackText, setPushbackText] = useState<string | null>(null)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const navigate = useNavigate()

  const done = submitted.every(Boolean)
  const current = steps[step]
  const completedCount = submitted.filter(Boolean).length

  useEffect(() => {
    if (!done) {
      textareaRef.current?.focus()
      setPushbackText(null)
      setIsAdvancing(false)
    }
  }, [step, done])

  // Sync answers to global context when done
  useEffect(() => {
    if (done) {
      setProblemCheckDone(true)
      setGlobalAnswers(answers)
    }
  }, [done, answers, setProblemCheckDone, setGlobalAnswers])

  const submit = useCallback(async () => {
    if (!answers[step].trim() || isAdvancing) return

    const upd = [...submitted]
    upd[step] = true
    setSubmitted(upd)
    setIsAdvancing(true)
    setPushbackText('⚡ Coach is analyzing...')

    let pb = ''
    try {
      const prompt = `You are a tough hackathon coach. The user is validating their problem statement.
Question: "${current.title}"
User's Answer: "${answers[step]}"
Provide ONE single sentence of blunt, constructive pushback or validation. If it's weak, call it out. If it's strong, validate it. Max 25 words.`
      pb = await generateGeminiResponse(prompt, answers[step])
    } catch (err) {
      pb = current.pushback[Math.floor(Math.random() * current.pushback.length)]
    }
    
    setPushbackText(pb)

    const isLast = step === steps.length - 1
    if (!isLast) {
      setTimeout(() => {
        setStep(prev => prev + 1)
      }, 2500)
    } else {
      setTimeout(() => {
        setIsAdvancing(false)
      }, 1000)
    }
  }, [answers, step, submitted, current.pushback, isAdvancing, current.title, geminiApiKey, steps.length])

  const wordCount = answers[step]?.trim().split(/\s+/).filter(Boolean).length || 0
  const isWeak = wordCount < 10 && answers[step]?.trim().length > 0

  return (
    <div className="fade-up" style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>◎ Problem Reality Check</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>
          Don't write code until you validate the problem. Answer honestly — AI will push back.
        </p>
      </div>

      {/* Progress stepper */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, alignItems: 'center' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: i < steps.length - 1 ? 1 : 0 }}>
            <div
              onClick={() => submitted[i] && !isAdvancing && setStep(i)}
              style={{
                width: 30, height: 30, borderRadius: '50%',
                cursor: submitted[i] && !isAdvancing ? 'pointer' : 'default',
                background: submitted[i] ? 'var(--accent)' : i === step ? 'var(--bg-elevated)' : 'var(--bg-elevated)',
                border: submitted[i] ? 'none' : i === step ? '2px solid var(--accent)' : '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                color: submitted[i] ? '#060a08' : i === step ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all 0.3s', flexShrink: 0,
                boxShadow: i === step ? '0 0 12px var(--accent-glow)' : 'none',
              }}
            >{submitted[i] ? '✓' : i + 1}</div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2,
                background: submitted[i] ? 'var(--accent)' : 'var(--border)',
                borderRadius: 99, transition: 'background 0.4s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Completion view */}
      {done ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ textAlign: 'center', padding: 40, background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Problem Validation Complete!</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
              All 5 questions answered. You have a validated foundation.<br />
              This is the bedrock your entire pitch will stand on.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/scope')}>
                Continue to Scope Guardian →
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/coach')}>
                Get AI Coach Feedback
              </button>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
              Your Validation Summary
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {steps.map((s, i) => (
                <div key={i} className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>Q{i + 1} · {s.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', borderLeft: '2px solid var(--border)', paddingLeft: 12, lineHeight: 1.7 }}>
                    {answers[i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--text-muted)' }}>
              <span>{completedCount} of {steps.length} questions answered</span>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{Math.round((completedCount / steps.length) * 100)}%</span>
            </div>
            <div className="progress-bar" style={{ height: 4 }}>
              <div className="progress-fill" style={{ width: `${(completedCount / steps.length) * 100}%` }} />
            </div>
          </div>

          {/* AI Coach question card */}
          <div className="card" style={{ marginBottom: 16, padding: '18px 20px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.15)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, background: 'var(--accent-dim)',
                border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--accent)', fontSize: 15, flexShrink: 0,
              }}>⚡</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>
                  Q{current.id} of {steps.length} · AI Coach
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.4, marginBottom: 8 }}>{current.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{current.coachQuestion}"
                </div>
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <textarea
              ref={textareaRef}
              className="textarea"
              rows={6}
              placeholder={current.placeholder}
              value={answers[step]}
              onChange={e => {
                const a = [...answers]
                a[step] = e.target.value
                setAnswers(a)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.metaKey) { e.preventDefault(); submit() }
              }}
              disabled={isAdvancing}
              style={{ resize: 'vertical', lineHeight: 1.8, opacity: isAdvancing ? 0.5 : 1 }}
            />
            <div style={{ position: 'absolute', bottom: 10, right: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              {isWeak && <span style={{ fontSize: 10, color: 'var(--yellow)', fontWeight: 600 }}>Too brief</span>}
              {wordCount >= 20 && <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>✓ Good depth</span>}
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{wordCount}w</span>
            </div>
          </div>

          {/* AI pushback (shown after submit) */}
          {pushbackText && (
            <div style={{
              padding: '14px 16px', borderRadius: 10, marginBottom: 14,
              background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)',
              display: 'flex', gap: 12, alignItems: 'flex-start',
              animation: 'fadeUp 0.3s ease',
            }}>
              <span style={{ fontSize: 15, color: 'var(--accent)', flexShrink: 0 }}>⚡</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>AI COACH FEEDBACK</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{pushbackText}</div>
                {isAdvancing && (
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Advancing to next question…
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {step > 0 && (
                <button className="btn btn-ghost" onClick={() => !isAdvancing && setStep(step - 1)} disabled={isAdvancing} style={{ fontSize: 12 }}>
                  ← Back
                </button>
              )}
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>⌘↵ to submit</span>
            </div>
            <button
              className="btn btn-primary"
              onClick={submit}
              disabled={!answers[step].trim() || isAdvancing}
              style={{ fontSize: 13, opacity: isAdvancing ? 0.5 : 1 }}
            >
              {isAdvancing ? 'Saved ✓' : step === steps.length - 1 ? 'Complete Validation ✓' : 'Submit & Next →'}
            </button>
          </div>

          {/* Previously answered */}
          {answers.some((a, i) => a && submitted[i]) && (
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                Previous Answers
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {steps.map((s, i) => submitted[i] && (
                  <div
                    key={i}
                    className="card"
                    style={{ padding: 14, cursor: isAdvancing ? 'default' : 'pointer' }}
                    onClick={() => !isAdvancing && setStep(i)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Q{i + 1} · {s.title}</div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Click to edit</span>
                    </div>
                    <div style={{
                      fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {answers[i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
