'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { formatRelative, todayISO } from '@/lib/utils'
import { URGE_TYPE_LABELS, type UrgeType } from '@/types'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

// ─── Bar chart (last 14 days) ─────────────────────────────────────────────────
function UrgeChart({ entries }: { entries: { date: string; count: number; label: string }[] }) {
  const max = Math.max(...entries.map((e) => e.count), 1)
  return (
    <div className="flex items-end gap-1 h-24">
      {entries.map((d, i) => {
        const isToday = d.date === todayISO()
        const height = Math.max((d.count / max) * 100, d.count > 0 ? 8 : 0)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group" title={`${d.count} urge${d.count !== 1 ? 's' : ''} — ${d.label}`}>
            <span className="text-[9px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
              {d.count}
            </span>
            <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
              <div
                className={`w-full rounded-t transition-all duration-300 ${isToday ? 'bg-purple-500' : 'bg-purple-800/60'}`}
                style={{ height: `${height}%`, minHeight: d.count > 0 ? '3px' : '0' }}
              />
            </div>
            <span className={`text-[9px] ${isToday ? 'text-purple-400 font-medium' : 'text-slate-600'}`}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function LogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addUrge, toast } = useApp()
  const [type, setType] = useState<UrgeType>('stalk')
  const [note, setNote] = useState('')

  const handleLog = () => {
    addUrge({ type, note: note.trim() || undefined, date: todayISO() })
    toast('Urge logged. You resisted.', 'success')
    setNote('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Log an Urge" subtitle="You noticed it. That's already a win." size="sm">
      <div className="space-y-4">
        <div>
          <label className="label">What kind of urge?</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(URGE_TYPE_LABELS) as UrgeType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="px-3 py-2.5 rounded-lg text-xs font-medium border transition-all text-left"
                style={type === t
                  ? { backgroundColor: '#5b3591' + '30', borderColor: '#7c52b8', color: '#b89ee0' }
                  : { borderColor: '#1f2d45', color: '#64748b', backgroundColor: '#161e2e' }
                }
              >
                {URGE_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="urge-note">What triggered it? (optional)</label>
          <textarea
            id="urge-note"
            className="textarea h-24"
            placeholder="A song, a place, a notification..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleLog}>Log It</button>
        </div>
      </div>
    </Modal>
  )
}

export default function UrgeTrackerPage() {
  const { urgeEntries, deleteUrge, toast } = useApp()
  const [logOpen, setLogOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  // Last 14 days chart data
  const chartData = useMemo(() => {
    const days: { date: string; count: number; label: string }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const date = d.toISOString().split('T')[0]
      days.push({
        date,
        count: urgeEntries.filter((e) => e.createdAt.startsWith(date)).length,
        label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).replace(' ', '\n'),
      })
    }
    return days
  }, [urgeEntries])

  // Stats
  const todayCount = urgeEntries.filter((e) => e.createdAt.startsWith(todayISO())).length
  const weekCount = useMemo(() => {
    const week = chartData.slice(-7)
    return week.reduce((s, d) => s + d.count, 0)
  }, [chartData])
  const totalCount = urgeEntries.length

  // Type breakdown
  const typeBreakdown = useMemo(() => {
    return (Object.keys(URGE_TYPE_LABELS) as UrgeType[]).map((t) => ({
      type: t,
      label: URGE_TYPE_LABELS[t],
      count: urgeEntries.filter((e) => e.type === t).length,
    })).sort((a, b) => b.count - a.count)
  }, [urgeEntries])

  const handleDelete = (id: string) => {
    deleteUrge(id)
    toast('Entry removed.', 'info')
    setConfirmId(null)
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Urge Tracker</h1>
          <p className="page-subtitle">Acknowledge the urge — then let it pass</p>
        </div>
        <button className="btn-primary" onClick={() => setLogOpen(true)}>+ Log Urge</button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Today', value: todayCount },
          { label: 'This week', value: weekCount },
          { label: 'Total logged', value: totalCount },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-2xl font-bold text-slate-100 tabular-nums">{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card mb-6">
        <h2 className="section-title mb-5">Last 14 days</h2>
        {totalCount === 0 ? (
          <div className="h-24 flex items-center justify-center">
            <p className="text-xs text-slate-600">No data yet</p>
          </div>
        ) : (
          <UrgeChart entries={chartData} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Type breakdown */}
        <div className="card">
          <h2 className="section-title mb-4">By type</h2>
          {typeBreakdown.every((t) => t.count === 0) ? (
            <p className="text-xs text-slate-600">No data yet.</p>
          ) : (
            <div className="space-y-2.5">
              {typeBreakdown.filter((t) => t.count > 0).map((t) => (
                <div key={t.type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{t.label}</span>
                    <span className="text-slate-500 tabular-nums">{t.count}</span>
                  </div>
                  <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-700 rounded-full"
                      style={{ width: `${(t.count / totalCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent entries */}
        <div className="card">
          <h2 className="section-title mb-4">Recent entries</h2>
          {urgeEntries.length === 0 ? (
            <EmptyState
              title="Nothing logged yet"
              description="When you feel the urge to check on her, log it here instead."
              action={<button className="btn-primary" onClick={() => setLogOpen(true)}>Log First Urge</button>}
            />
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
              {urgeEntries.slice(0, 20).map((e) => (
                <div key={e.id} className="flex items-start gap-3 py-2 border-b border-surface-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-purple-400">{URGE_TYPE_LABELS[e.type]}</span>
                      <span className="text-[11px] text-slate-600">{formatRelative(e.createdAt)}</span>
                    </div>
                    {e.note && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{e.note}</p>}
                  </div>
                  <button
                    className="btn-ghost p-1 text-red-500/40 hover:text-red-400 flex-shrink-0"
                    onClick={() => setConfirmId(e.id)}
                    aria-label="Remove"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <LogModal open={logOpen} onClose={() => setLogOpen(false)} />
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        message="Remove this urge entry?"
        confirmLabel="Remove"
      />
    </div>
  )
}
