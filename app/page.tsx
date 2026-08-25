'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { useNoContactTimer } from '@/hooks/useNoContact'
import { formatRelative, formatDate, todayISO, generateId } from '@/lib/utils'
import {
  MOOD_LABELS, MOOD_COLORS, URGE_TYPE_LABELS,
  MESSAGE_EMOTION_LABELS, MESSAGE_EMOTION_COLORS,
  REFLECTION_PROMPTS, type MoodLevel, type UrgeType, type MessageEmotion
} from '@/types'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'

// ─── No Contact Card ──────────────────────────────────────────────────────────
function NoContactCard() {
  const { user } = useApp()
  const duration = useNoContactTimer(user.noContact)

  if (!user.noContact) {
    return (
      <div className="card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">No Contact</p>
          <Link href="/no-contact" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors">Set up</Link>
        </div>
        <p className="text-sm text-slate-500">No contact timer not started yet.</p>
      </div>
    )
  }

  const milestones = [7, 14, 30, 60, 90, 180, 365]
  const next = milestones.find((m) => m > duration.days)
  const progressPct = next ? Math.min(100, (duration.days / next) * 100) : 100

  return (
    <div className="card border-purple-800/30 bg-gradient-to-br from-surface-card to-purple-950/20">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">No Contact</p>
        <Link href="/no-contact" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors">Details</Link>
      </div>

      {/* Timer display */}
      <div className="flex items-end gap-3 mb-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-slate-100 tabular-nums leading-none">{duration.days}</p>
          <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">days</p>
        </div>
        <div className="flex gap-2 mb-1">
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-400 tabular-nums leading-none">{String(duration.hours).padStart(2,'0')}</p>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider">hr</p>
          </div>
          <span className="text-slate-600 mb-0.5">:</span>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-400 tabular-nums leading-none">{String(duration.minutes).padStart(2,'0')}</p>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider">min</p>
          </div>
          <span className="text-slate-600 mb-0.5">:</span>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-400 tabular-nums leading-none animate-pulse-soft">{String(duration.seconds).padStart(2,'0')}</p>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider">sec</p>
          </div>
        </div>
      </div>

      {/* Progress to next milestone */}
      {next && (
        <div>
          <div className="flex justify-between text-[10px] text-slate-600 mb-1.5">
            <span>Progress to {next} days</span>
            <span>{duration.days}/{next}</span>
          </div>
          <div className="h-1 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
      {!next && (
        <p className="text-xs text-purple-400 font-medium">365+ days. Remarkable.</p>
      )}
    </div>
  )
}

// ─── Urge Summary Card ────────────────────────────────────────────────────────
function UrgeSummaryCard() {
  const { urgeEntries, addUrge, toast } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [type, setType] = useState<UrgeType>('stalk')
  const [note, setNote] = useState('')

  const todayCount = urgeEntries.filter(
    (e) => e.createdAt.startsWith(todayISO())
  ).length

  // Last 7 days bar chart data
  const last7: { label: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    last7.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      count: urgeEntries.filter((e) => e.createdAt.startsWith(key)).length,
    })
  }
  const maxCount = Math.max(...last7.map((d) => d.count), 1)

  const handleLog = () => {
    addUrge({ type, note: note.trim() || undefined, date: todayISO() })
    toast('Urge logged. You resisted.', 'success')
    setNote('')
    setShowModal(false)
  }

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Urge Tracker</p>
          <div className="flex items-center gap-2">
            <Link href="/urge-tracker" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors">View all</Link>
            <button
              onClick={() => setShowModal(true)}
              className="text-[11px] bg-surface-hover hover:bg-surface-muted text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md border border-surface-border transition-all"
            >
              + Log
            </button>
          </div>
        </div>

        {/* Today count */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-slate-100 tabular-nums">{todayCount}</span>
          <span className="text-xs text-slate-500">urges today</span>
        </div>

        {/* Mini bar chart */}
        <div className="flex items-end gap-1 h-10">
          {last7.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-purple-700/60 transition-all duration-300 min-h-[2px]"
                style={{ height: `${(d.count / maxCount) * 100}%` }}
                title={`${d.count} urge${d.count !== 1 ? 's' : ''}`}
              />
              <span className="text-[9px] text-slate-600">{d.label[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log an Urge" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">What kind of urge?</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(URGE_TYPE_LABELS) as UrgeType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    type === t
                      ? 'bg-purple-800/50 border-purple-600 text-purple-300'
                      : 'bg-surface-hover border-surface-border text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {URGE_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="urge-note">Note (optional)</label>
            <textarea
              id="urge-note"
              className="textarea h-20"
              placeholder="What triggered it?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleLog}>Log Urge</button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ─── Daily Diary Prompt ───────────────────────────────────────────────────────
const DAILY_PROMPTS = [
  'What are you feeling right now, without filtering it?',
  'What\'s one thing you are proud of yourself for today?',
  'What did you do today that was just for you?',
  'What thought kept coming back to you today?',
  'Where in your body do you feel the grief today?',
  'What would make tomorrow slightly better?',
  'Who showed up for you today, even in a small way?',
]

function DiaryPromptCard() {
  const { addDiaryEntry, toast } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<MoodLevel>(3)
  const [title, setTitle] = useState('')

  const todayPrompt = DAILY_PROMPTS[new Date().getDay() % DAILY_PROMPTS.length]

  const handleSave = () => {
    if (!content.trim()) return
    addDiaryEntry({
      date: todayISO(),
      mood,
      title: title.trim() || `Entry — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      content: content.trim(),
      tags: [],
    })
    toast('Diary entry saved.', 'success')
    setContent('')
    setTitle('')
    setMood(3)
    setShowModal(false)
  }

  return (
    <>
      <div className="card-hover cursor-pointer" onClick={() => setShowModal(true)}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Today&apos;s Diary</p>
          <Link href="/diary" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors" onClick={(e) => e.stopPropagation()}>All entries</Link>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed italic">&ldquo;{todayPrompt}&rdquo;</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Click to write
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Entry" size="md">
        <div className="space-y-4">
          <div className="bg-surface-hover rounded-lg px-4 py-3 border border-surface-border">
            <p className="text-xs text-slate-500 italic">&ldquo;{todayPrompt}&rdquo;</p>
          </div>
          <div>
            <label className="label" htmlFor="diary-title">Title (optional)</label>
            <input id="diary-title" className="input" placeholder="Give this entry a name..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">How are you feeling?</label>
            <div className="flex gap-2">
              {([1,2,3,4,5] as MoodLevel[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                    mood === m ? 'border-purple-600 text-slate-100' : 'border-surface-border text-slate-500 hover:text-slate-300'
                  }`}
                  style={mood === m ? { backgroundColor: MOOD_COLORS[m] + '30', borderColor: MOOD_COLORS[m] } : {}}
                  title={MOOD_LABELS[m]}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-1">{MOOD_LABELS[mood]}</p>
          </div>
          <div>
            <label className="label" htmlFor="diary-content">What&apos;s on your mind?</label>
            <textarea
              id="diary-content"
              className="textarea h-40"
              placeholder="Write freely. No one else will read this."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" disabled={!content.trim()} onClick={handleSave}>Save Entry</button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ─── Curiosity Card ───────────────────────────────────────────────────────────
function CuriosityCard() {
  const { curiosityEntries, addCuriosity, toast } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [question, setQuestion] = useState('')
  const [intensity, setIntensity] = useState<1|2|3>(2)

  const handleSave = () => {
    if (!question.trim()) return
    addCuriosity({ question: question.trim(), intensity, resolved: false })
    toast('Curiosity noted. No action needed.', 'info')
    setQuestion('')
    setIntensity(2)
    setShowModal(false)
  }

  const recent = curiosityEntries.slice(0, 3)

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">I Want To Know</p>
          <div className="flex items-center gap-2">
            <Link href="/curiosity" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors">View all</Link>
            <button onClick={() => setShowModal(true)} className="text-[11px] bg-surface-hover hover:bg-surface-muted text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md border border-surface-border transition-all">+ Add</button>
          </div>
        </div>
        {recent.length === 0 ? (
          <p className="text-xs text-slate-600">No curiosities logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((e) => (
              <li key={e.id} className="flex items-start gap-2 text-sm text-slate-400">
                <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${e.intensity === 3 ? 'bg-rose-500' : e.intensity === 2 ? 'bg-yellow-500' : 'bg-slate-500'}`} />
                <span className="line-clamp-1">{e.question}</span>
              </li>
            ))}
          </ul>
        )}
        {curiosityEntries.length > 3 && (
          <p className="text-[11px] text-slate-600 mt-2">+{curiosityEntries.length - 3} more</p>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="I Want To Know" subtitle="Write it down so you don't act on it." size="sm">
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="curiosity-q">What do you want to know?</label>
            <textarea
              id="curiosity-q"
              className="textarea h-24"
              placeholder="e.g. Is she doing okay? Is she seeing someone?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="label">How strong is this feeling?</label>
            <div className="flex gap-2">
              {([1,2,3] as const).map((i) => (
                <button
                  key={i}
                  onClick={() => setIntensity(i)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${intensity === i ? 'bg-purple-800/40 border-purple-600 text-purple-300' : 'border-surface-border text-slate-500 hover:text-slate-300 bg-surface-hover'}`}
                >
                  {i === 1 ? 'Mild' : i === 2 ? 'Strong' : 'Overwhelming'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" disabled={!question.trim()} onClick={handleSave}>Note It</button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ─── Recent Memories ──────────────────────────────────────────────────────────
function MemoriesCard() {
  const { memories } = useApp()
  const recent = [...memories].reverse().slice(0, 3)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Memories</p>
        <Link href="/memories" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors">Timeline</Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-xs text-slate-600">No memories recorded yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {recent.map((m) => (
            <li key={m.id} className="flex items-start gap-3">
              <div className="w-1 h-full min-h-[2rem] bg-purple-800/40 rounded-full flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-slate-300 font-medium leading-snug">{m.title}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Reflection Card ──────────────────────────────────────────────────────────
function ReflectionCard() {
  const { saveReflection, reflections, toast } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [answer, setAnswer] = useState('')

  const prompt = REFLECTION_PROMPTS[new Date().getDate() % REFLECTION_PROMPTS.length]
  const existing = reflections.find((r) => r.promptId === prompt.id)

  const handleSave = () => {
    if (!answer.trim()) return
    saveReflection(prompt.id, answer.trim())
    toast('Reflection saved.', 'success')
    setAnswer('')
    setShowModal(false)
  }

  return (
    <>
      <div className="card-hover cursor-pointer" onClick={() => { setAnswer(existing?.answer || ''); setShowModal(true) }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Reflection</p>
          <Link href="/reflection" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors" onClick={(e) => e.stopPropagation()}>All</Link>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-medium">{prompt.question}</p>
        {existing ? (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">&ldquo;{existing.answer}&rdquo;</p>
        ) : (
          <p className="text-xs text-slate-600 mt-2">Tap to reflect...</p>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Reflection" size="md">
        <div className="space-y-4">
          <div className="bg-surface-hover rounded-lg px-4 py-3 border border-surface-border">
            <p className="text-sm text-slate-300 font-medium leading-relaxed">{prompt.question}</p>
          </div>
          <div>
            <label className="label" htmlFor="reflection-answer">Your answer</label>
            <textarea
              id="reflection-answer"
              className="textarea h-36"
              placeholder="Be honest with yourself..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" disabled={!answer.trim()} onClick={handleSave}>Save Reflection</button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ─── Unsent Message Card ──────────────────────────────────────────────────────
function UnsentCard() {
  const { addUnsentMessage, unsentMessages, toast } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState('')
  const [emotion, setEmotion] = useState<MessageEmotion>('longing')

  const handleSend = () => {
    if (!content.trim()) return
    addUnsentMessage({ content: content.trim(), subject: subject.trim() || undefined, emotion })
    toast('Message written. It stays here.', 'info')
    setContent('')
    setSubject('')
    setEmotion('longing')
    setShowModal(false)
  }

  const latest = unsentMessages[0]

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Unsent Message</p>
          <div className="flex items-center gap-2">
            <Link href="/unsent" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors">All</Link>
            <button onClick={() => setShowModal(true)} className="text-[11px] bg-surface-hover hover:bg-surface-muted text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md border border-surface-border transition-all">+ Write</button>
          </div>
        </div>
        {latest ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className="badge text-[10px]"
                style={{
                  backgroundColor: MESSAGE_EMOTION_COLORS[latest.emotion] + '20',
                  color: MESSAGE_EMOTION_COLORS[latest.emotion],
                }}
              >
                {MESSAGE_EMOTION_LABELS[latest.emotion]}
              </span>
              <span className="text-[11px] text-slate-600">{formatRelative(latest.createdAt)}</span>
            </div>
            {latest.subject && <p className="text-sm font-medium text-slate-300">{latest.subject}</p>}
            <p className="text-xs text-slate-500 line-clamp-2">{latest.content}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-600">No unsent messages yet. Write what you can&apos;t say.</p>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Write an Unsent Message" subtitle="This stays here. It will never be sent." size="md">
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="unsent-subject">Subject (optional)</label>
            <input id="unsent-subject" className="input" placeholder="What is this about?" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="label">Emotion</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(MESSAGE_EMOTION_LABELS) as MessageEmotion[]).map((e) => (
                <button
                  key={e}
                  onClick={() => setEmotion(e)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    emotion === e
                      ? 'text-slate-100'
                      : 'border-surface-border text-slate-500 hover:text-slate-300 bg-surface-hover'
                  }`}
                  style={emotion === e ? {
                    backgroundColor: MESSAGE_EMOTION_COLORS[e] + '25',
                    borderColor: MESSAGE_EMOTION_COLORS[e],
                    color: MESSAGE_EMOTION_COLORS[e],
                  } : {}}
                >
                  {MESSAGE_EMOTION_LABELS[e]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="unsent-content">Message</label>
            <textarea
              id="unsent-content"
              className="textarea h-40"
              placeholder="Dear her..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" disabled={!content.trim()} onClick={handleSend}>Write It</button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ─── Future Me Preview ────────────────────────────────────────────────────────
function FutureMeCard() {
  const { futureMeEntries } = useApp()
  const total = futureMeEntries.length
  const done = futureMeEntries.filter((e) => e.completed).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Future Me</p>
        <Link href="/future-me" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors">Manage</Link>
      </div>
      {total === 0 ? (
        <p className="text-xs text-slate-600">Set goals for 3, 6, and 12 months from now.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-100">{done}/{total}</span>
            <span className="text-xs text-slate-500">goals completed</span>
          </div>
          <div>
            <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1">{pct}% complete</p>
          </div>
          {futureMeEntries.filter((e) => !e.completed).slice(0, 2).map((e) => (
            <div key={e.id} className="flex items-start gap-2 text-xs text-slate-500">
              <span className="w-1 h-1 rounded-full bg-purple-700 flex-shrink-0 mt-1.5" />
              <span className="line-clamp-1">{e.goal}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Greeting ─────────────────────────────────────────────────────────────────
function Greeting() {
  const { user, diaryEntries } = useApp()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const todayEntry = diaryEntries.find((e) => e.date === todayISO())

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-slate-100">
        {greeting}{user.name ? `, ${user.name}` : ''}.
      </h2>
      <p className="text-sm text-slate-500 mt-1">
        {todayEntry
          ? `You wrote in your diary today. Keep going.`
          : `You haven't written today yet. Take a moment.`}
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div>
      <Greeting />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Row 1 */}
        <div className="sm:col-span-2 lg:col-span-1">
          <NoContactCard />
        </div>
        <UrgeSummaryCard />
        <DiaryPromptCard />

        {/* Row 2 */}
        <CuriosityCard />
        <MemoriesCard />
        <ReflectionCard />

        {/* Row 3 */}
        <div className="sm:col-span-2">
          <UnsentCard />
        </div>
        <FutureMeCard />
      </div>
    </div>
  )
}
