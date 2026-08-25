'use client'

import { useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { useNoContactTimer } from '@/hooks/useNoContact'
import { todayISO } from '@/lib/utils'
import {
  MOOD_COLORS,
  MOOD_LABELS,
  URGE_TYPE_LABELS,
  MESSAGE_EMOTION_LABELS,
  MEMORY_CATEGORY_LABELS,
  REFLECTION_PROMPTS,
  type MoodLevel,
  type UrgeType,
} from '@/types'

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: string
}) {
  return (
    <div className="card">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      <p
        className="text-3xl font-bold tabular-nums"
        style={{ color: accent || '#f1f5f9' }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  )
}

// ─── Mini bar ─────────────────────────────────────────────────────────────────
function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-500 tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ─── Mood chart (last 30 days) ────────────────────────────────────────────────
function MoodTimeline({ entries }: { entries: { date: string; mood: MoodLevel }[] }) {
  const last30: { date: string; mood: MoodLevel | null }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = d.toISOString().split('T')[0]
    const entry = entries.find((e) => e.date === date)
    last30.push({ date, mood: entry?.mood ?? null })
  }

  return (
    <div className="flex items-end gap-0.5 h-16">
      {last30.map((d, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-300"
          style={{
            height: d.mood ? `${(d.mood / 5) * 100}%` : '4px',
            backgroundColor: d.mood ? MOOD_COLORS[d.mood] + (d.mood ? 'cc' : '30') : '#1f2d45',
            minHeight: '4px',
          }}
          title={d.mood ? `${d.date}: ${MOOD_LABELS[d.mood]}` : d.date}
        />
      ))}
    </div>
  )
}

// ─── Urge streak ─────────────────────────────────────────────────────────────
function getUrgeStreak(urgeEntries: { createdAt: string }[]): { current: number; best: number } {
  // "clean days" = days with zero urges
  const today = new Date()
  let current = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const hasUrge = urgeEntries.some((e) => e.createdAt.startsWith(key))
    if (!hasUrge) current++
    else break
  }

  let best = 0
  let streak = 0
  const allDates = new Set(urgeEntries.map((e) => e.createdAt.split('T')[0]))
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    if (!allDates.has(key)) {
      streak++
      best = Math.max(best, streak)
    } else {
      streak = 0
    }
  }

  return { current, best }
}

export default function StatisticsPage() {
  const { user, diaryEntries, urgeEntries, unsentMessages, memories, curiosityEntries, reflections, futureMeEntries } = useApp()
  const duration = useNoContactTimer(user.noContact)

  const today = todayISO()

  // ─── Diary stats ──────────────────────────────────────────────────────────
  const diaryStats = useMemo(() => {
    const totalWords = diaryEntries.reduce((sum, e) => sum + e.content.split(/\s+/).length, 0)
    const avgMood = diaryEntries.length
      ? Math.round((diaryEntries.reduce((s, e) => s + e.mood, 0) / diaryEntries.length) * 10) / 10
      : 0
    const todayEntry = diaryEntries.find((e) => e.date === today)

    // Streak
    let streak = 0
    for (let i = 0; i < 365; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      if (diaryEntries.some((e) => e.date === key)) streak++
      else break
    }

    // Mood distribution
    const moodDist = ([1, 2, 3, 4, 5] as MoodLevel[]).map((m) => ({
      mood: m,
      count: diaryEntries.filter((e) => e.mood === m).length,
    }))

    return { totalWords, avgMood, streak, todayEntry, moodDist }
  }, [diaryEntries, today])

  // ─── Urge stats ───────────────────────────────────────────────────────────
  const urgeStats = useMemo(() => {
    const todayCount = urgeEntries.filter((e) => e.createdAt.startsWith(today)).length
    const weekCount = urgeEntries.filter((e) => {
      const d = new Date(e.createdAt)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 7)
      return d >= cutoff
    }).length
    const streak = getUrgeStreak(urgeEntries)

    // Type breakdown
    const typeDist = (Object.keys(URGE_TYPE_LABELS) as UrgeType[]).map((t) => ({
      type: t,
      label: URGE_TYPE_LABELS[t],
      count: urgeEntries.filter((e) => e.type === t).length,
    }))

    return { todayCount, weekCount, streak, typeDist }
  }, [urgeEntries, today])

  // ─── Future Me ────────────────────────────────────────────────────────────
  const futureStats = useMemo(() => {
    const total = futureMeEntries.length
    const done = futureMeEntries.filter((e) => e.completed).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, pct }
  }, [futureMeEntries])

  // ─── Reflection ───────────────────────────────────────────────────────────
  const reflectionStats = useMemo(() => {
    const answered = reflections.length
    const total = REFLECTION_PROMPTS.length
    return { answered, total, pct: Math.round((answered / total) * 100) }
  }, [reflections])

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Progress</h1>
        <p className="page-subtitle">You have come further than you think</p>
      </div>

      {/* ── No Contact ── */}
      <section className="mb-8">
        <h2 className="section-title mb-4">No Contact</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Days" value={duration.days} sub="of no contact" accent="#9b7ad4" />
          <StatCard label="Hours" value={duration.hours} sub="this day" />
          <StatCard label="Minutes" value={String(duration.minutes).padStart(2, '0')} sub="this hour" />
          <StatCard
            label="Status"
            value={duration.days >= 30 ? 'Strong' : duration.days >= 14 ? 'Building' : duration.days >= 7 ? 'Starting' : 'Day 1'}
            sub={user.noContact ? 'since ' + new Date(user.noContact.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not started'}
            accent={duration.days >= 30 ? '#22c55e' : duration.days >= 7 ? '#eab308' : '#ef4444'}
          />
        </div>
      </section>

      {/* ── Diary ── */}
      <section className="mb-8">
        <h2 className="section-title mb-4">Diary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatCard label="Entries" value={diaryEntries.length} sub="total written" />
          <StatCard label="Words" value={diaryStats.totalWords.toLocaleString()} sub="across all entries" />
          <StatCard label="Streak" value={`${diaryStats.streak}d`} sub="consecutive days" accent="#9b7ad4" />
          <StatCard label="Avg Mood" value={diaryStats.avgMood || '—'} sub="out of 5" accent={diaryStats.avgMood ? MOOD_COLORS[Math.round(diaryStats.avgMood) as MoodLevel] : undefined} />
        </div>

        {diaryEntries.length > 0 && (
          <div className="card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Mood — Last 30 Days</p>
            <MoodTimeline entries={diaryEntries} />
            <div className="flex gap-3 mt-3 flex-wrap">
              {([1,2,3,4,5] as MoodLevel[]).map((m) => (
                <div key={m} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: MOOD_COLORS[m] }} />
                  <span className="text-[10px] text-slate-600">{MOOD_LABELS[m]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Urge ── */}
      <section className="mb-8">
        <h2 className="section-title mb-4">Urge Tracker</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatCard label="Total Logged" value={urgeEntries.length} sub="urges acknowledged" />
          <StatCard label="This Week" value={urgeStats.weekCount} sub="in last 7 days" />
          <StatCard label="Today" value={urgeStats.todayCount} sub="urges today" />
          <StatCard label="Clean Days" value={`${urgeStats.streak.current}d`} sub={`best: ${urgeStats.streak.best}d`} accent="#22c55e" />
        </div>

        {urgeEntries.length > 0 && (
          <div className="card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">By Type</p>
            <div className="space-y-3">
              {urgeStats.typeDist
                .filter((t) => t.count > 0)
                .sort((a, b) => b.count - a.count)
                .map((t) => (
                  <MiniBar
                    key={t.type}
                    label={t.label}
                    value={t.count}
                    max={urgeEntries.length}
                    color="#9b7ad4"
                  />
                ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Content ── */}
      <section className="mb-8">
        <h2 className="section-title mb-4">Your Work</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Unsent Msgs" value={unsentMessages.length} sub="written, never sent" accent="#ec4899" />
          <StatCard label="Curiosities" value={curiosityEntries.length} sub={`${curiosityEntries.filter((e) => e.resolved).length} resolved`} />
          <StatCard label="Memories" value={memories.length} sub="on your timeline" accent="#eab308" />
          <StatCard label="Reflections" value={`${reflectionStats.answered}/${reflectionStats.total}`} sub={`${reflectionStats.pct}% answered`} accent="#3b82f6" />
        </div>
      </section>

      {/* ── Future Me ── */}
      <section className="mb-8">
        <h2 className="section-title mb-4">Future Me</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total Goals" value={futureStats.total} sub="set" />
          <StatCard label="Completed" value={futureStats.done} sub="achieved" accent="#22c55e" />
          <StatCard label="Progress" value={`${futureStats.pct}%`} sub="overall" accent="#9b7ad4" />
        </div>
        {futureStats.total > 0 && (
          <div className="mt-3 h-2 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-700"
              style={{ width: `${futureStats.pct}%` }}
            />
          </div>
        )}
      </section>

      {/* ── Overall summary ── */}
      <section>
        <div className="card border-purple-800/30 bg-gradient-to-br from-surface-card to-purple-950/10">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Overall Engagement</p>
          <div className="space-y-3">
            <MiniBar label="Diary entries" value={diaryEntries.length} max={Math.max(diaryEntries.length, 30)} color="#9b7ad4" />
            <MiniBar label="Urges acknowledged" value={urgeEntries.length} max={Math.max(urgeEntries.length, 30)} color="#ec4899" />
            <MiniBar label="Reflections answered" value={reflectionStats.answered} max={reflectionStats.total} color="#3b82f6" />
            <MiniBar label="Goals set" value={futureStats.total} max={Math.max(futureStats.total, 12)} color="#22c55e" />
            <MiniBar label="Unsent messages" value={unsentMessages.length} max={Math.max(unsentMessages.length, 10)} color="#f59e0b" />
          </div>
        </div>
      </section>
    </div>
  )
}
