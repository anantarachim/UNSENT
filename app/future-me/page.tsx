'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { formatDate } from '@/lib/utils'
import {
  FUTURE_CATEGORY_LABELS,
  HORIZON_LABELS,
  type FutureMeEntry,
  type FutureCategory,
} from '@/types'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const CATEGORY_COLORS: Record<FutureCategory, string> = {
  health: '#22c55e',
  career: '#3b82f6',
  social: '#ec4899',
  personal: '#9b7ad4',
  travel: '#f59e0b',
  skill: '#06b6d4',
}

const HORIZON_ORDER = ['3m', '6m', '12m'] as const

function GoalCard({
  entry,
  onToggle,
  onDelete,
}: {
  entry: FutureMeEntry
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <div
        className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
          entry.completed
            ? 'bg-surface-card border-surface-border opacity-60'
            : 'bg-surface-card border-surface-border hover:border-purple-800/50'
        }`}
      >
        {/* Checkbox */}
        <button
          onClick={() => onToggle(entry.id)}
          className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            entry.completed
              ? 'bg-purple-700 border-purple-600'
              : 'border-surface-muted hover:border-purple-600'
          }`}
          aria-label={entry.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {entry.completed && (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="badge text-[10px]"
              style={{
                backgroundColor: CATEGORY_COLORS[entry.category] + '20',
                color: CATEGORY_COLORS[entry.category],
              }}
            >
              {FUTURE_CATEGORY_LABELS[entry.category]}
            </span>
          </div>
          <p
            className={`text-sm leading-relaxed ${
              entry.completed ? 'text-slate-500 line-through' : 'text-slate-300'
            }`}
          >
            {entry.goal}
          </p>
        </div>

        <button
          className="btn-ghost p-1.5 text-red-500/40 hover:text-red-400 flex-shrink-0"
          onClick={() => setConfirmOpen(true)}
          aria-label="Delete goal"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => onDelete(entry.id)}
        message="Remove this goal?"
        confirmLabel="Remove"
      />
    </>
  )
}

function AddGoalModal({
  open,
  onClose,
  defaultHorizon,
}: {
  open: boolean
  onClose: () => void
  defaultHorizon?: string
}) {
  const { addFutureMe, toast } = useApp()
  const [goal, setGoal] = useState('')
  const [horizon, setHorizon] = useState<'3m' | '6m' | '12m'>(
    (defaultHorizon as '3m' | '6m' | '12m') || '3m'
  )
  const [category, setCategory] = useState<FutureCategory>('personal')

  const handleSave = () => {
    if (!goal.trim()) return
    addFutureMe({ goal: goal.trim(), horizon, category, completed: false })
    toast('Goal added.', 'success')
    setGoal('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a Goal" subtitle="Who do you want to become?" size="md">
      <div className="space-y-4">
        <div>
          <label className="label">Timeframe</label>
          <div className="flex gap-2">
            {HORIZON_ORDER.map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className="flex-1 py-2 rounded-lg text-xs font-medium border transition-all"
                style={
                  horizon === h
                    ? { backgroundColor: '#5b3591' + '30', borderColor: '#7c52b8', color: '#b89ee0' }
                    : { borderColor: '#1f2d45', color: '#64748b', backgroundColor: '#161e2e' }
                }
              >
                {HORIZON_LABELS[h]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(FUTURE_CATEGORY_LABELS) as FutureCategory[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="px-3 py-2 rounded-lg text-xs font-medium border transition-all"
                style={
                  category === c
                    ? {
                        backgroundColor: CATEGORY_COLORS[c] + '20',
                        borderColor: CATEGORY_COLORS[c],
                        color: CATEGORY_COLORS[c],
                      }
                    : { borderColor: '#1f2d45', color: '#64748b', backgroundColor: '#161e2e' }
                }
              >
                {FUTURE_CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="goal-text">
            Your goal
          </label>
          <textarea
            id="goal-text"
            className="textarea h-28"
            placeholder="e.g. Run 5km without stopping. Learn to cook three new dishes."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!goal.trim()} onClick={handleSave}>
            Add Goal
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function FutureMePage() {
  const { futureMeEntries, toggleFutureMe, deleteFutureMe, toast } = useApp()
  const [addOpen, setAddOpen] = useState(false)
  const [addHorizon, setAddHorizon] = useState<string>('3m')
  const [activeTab, setActiveTab] = useState<'3m' | '6m' | '12m' | 'all'>('all')

  const handleToggle = (id: string) => {
    const e = futureMeEntries.find((x) => x.id === id)
    if (!e) return
    toggleFutureMe(id)
    toast(e.completed ? 'Marked incomplete.' : 'Goal completed. Keep going.', 'success')
  }

  const handleDelete = (id: string) => {
    deleteFutureMe(id)
    toast('Goal removed.', 'info')
  }

  const openAdd = (horizon: string) => {
    setAddHorizon(horizon)
    setAddOpen(true)
  }

  // Per-horizon stats
  const stats = useMemo(() => {
    return HORIZON_ORDER.map((h) => {
      const items = futureMeEntries.filter((e) => e.horizon === h)
      const done = items.filter((e) => e.completed).length
      return { horizon: h, total: items.length, done }
    })
  }, [futureMeEntries])

  const totalGoals = futureMeEntries.length
  const totalDone = futureMeEntries.filter((e) => e.completed).length

  const filtered = useMemo(() => {
    if (activeTab === 'all') return futureMeEntries
    return futureMeEntries.filter((e) => e.horizon === activeTab)
  }, [futureMeEntries, activeTab])

  // Group filtered by horizon when showing 'all'
  const groupedAll = useMemo(() => {
    if (activeTab !== 'all') return null
    const map: Record<string, FutureMeEntry[]> = {}
    HORIZON_ORDER.forEach((h) => {
      map[h] = futureMeEntries.filter((e) => e.horizon === h)
    })
    return map
  }, [futureMeEntries, activeTab])

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Future Me</h1>
          <p className="page-subtitle">Who you are becoming matters more than who you lost</p>
        </div>
        <button className="btn-primary" onClick={() => openAdd('3m')}>
          + Add Goal
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map(({ horizon, total, done }) => {
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          return (
            <div key={horizon} className="card text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {HORIZON_LABELS[horizon]}
              </p>
              <p className="text-2xl font-bold text-slate-100 tabular-nums">
                {done}<span className="text-slate-600 text-base font-normal">/{total}</span>
              </p>
              <div className="mt-2 h-1 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-1">{pct}%</p>
            </div>
          )
        })}
      </div>

      {/* Tab filter */}
      <div className="flex gap-1.5 mb-5">
        {(['all', ...HORIZON_ORDER] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeTab === t
                ? 'bg-purple-800/40 border-purple-600 text-purple-300'
                : 'border-surface-border text-slate-500 bg-surface-card hover:text-slate-300'
            }`}
          >
            {t === 'all' ? 'All' : HORIZON_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Goals */}
      {totalGoals === 0 ? (
        <EmptyState
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          }
          title="No goals yet"
          description="Set what you want to achieve in 3, 6, and 12 months. Make it about you."
          action={
            <button className="btn-primary" onClick={() => setAddOpen(true)}>
              Add First Goal
            </button>
          }
        />
      ) : activeTab === 'all' && groupedAll ? (
        <div className="space-y-8">
          {HORIZON_ORDER.map((h) => {
            const items = groupedAll[h]
            if (items.length === 0) return null
            const done = items.filter((e) => e.completed).length
            return (
              <section key={h}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="section-title">{HORIZON_LABELS[h]}</h2>
                    <span className="text-[10px] text-slate-600 tabular-nums">
                      {done}/{items.length}
                    </span>
                  </div>
                  <button
                    className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
                    onClick={() => openAdd(h)}
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2">
                  {items.map((e) => (
                    <GoalCard key={e.id} entry={e} onToggle={handleToggle} onDelete={handleDelete} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500 mb-3">No goals for {HORIZON_LABELS[activeTab as keyof typeof HORIZON_LABELS]}.</p>
              <button className="btn-primary" onClick={() => openAdd(activeTab)}>
                Add Goal
              </button>
            </div>
          ) : (
            filtered.map((e) => (
              <GoalCard key={e.id} entry={e} onToggle={handleToggle} onDelete={handleDelete} />
            ))
          )}
        </div>
      )}

      <AddGoalModal open={addOpen} onClose={() => setAddOpen(false)} defaultHorizon={addHorizon} />
    </div>
  )
}
