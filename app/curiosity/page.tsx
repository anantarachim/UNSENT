'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { formatRelative } from '@/lib/utils'
import { type CuriosityEntry } from '@/types'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const INTENSITY_LABELS = { 1: 'Mild', 2: 'Strong', 3: 'Overwhelming' } as const
const INTENSITY_COLORS = { 1: '#64748b', 2: '#eab308', 3: '#ef4444' } as const

function IntensityBadge({ intensity }: { intensity: 1 | 2 | 3 }) {
  return (
    <span
      className="badge text-[10px]"
      style={{ backgroundColor: INTENSITY_COLORS[intensity] + '20', color: INTENSITY_COLORS[intensity] }}
    >
      {INTENSITY_LABELS[intensity]}
    </span>
  )
}

function CuriosityCard({
  entry,
  onToggle,
  onEdit,
  onDelete,
}: {
  entry: CuriosityEntry
  onToggle: (id: string) => void
  onEdit: (e: CuriosityEntry) => void
  onDelete: (id: string) => void
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <div className={`card transition-all duration-200 ${entry.resolved ? 'opacity-50' : ''}`}>
        <div className="flex items-start gap-3">
          {/* Resolve toggle */}
          <button
            onClick={() => onToggle(entry.id)}
            className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
              entry.resolved
                ? 'bg-purple-700 border-purple-600'
                : 'border-surface-muted hover:border-purple-600'
            }`}
            aria-label={entry.resolved ? 'Mark unresolved' : 'Mark resolved'}
          >
            {entry.resolved && (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <IntensityBadge intensity={entry.intensity} />
              {entry.resolved && (
                <span className="badge bg-green-900/30 text-green-500 text-[10px]">Resolved</span>
              )}
              <span className="text-[11px] text-slate-600">{formatRelative(entry.createdAt)}</span>
            </div>
            <p className={`text-sm leading-relaxed ${entry.resolved ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
              {entry.question}
            </p>
            {entry.note && (
              <p className="text-xs text-slate-500 mt-1.5 italic">{entry.note}</p>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="btn-ghost p-1.5" onClick={() => onEdit(entry)} aria-label="Edit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button className="btn-ghost p-1.5 text-red-500/60 hover:text-red-400" onClick={() => setConfirmOpen(true)} aria-label="Delete">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => onDelete(entry.id)} message="This curiosity entry will be deleted." />
    </>
  )
}

function WriteModal({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: CuriosityEntry | null }) {
  const { addCuriosity, updateCuriosity, toast } = useApp()
  const [question, setQuestion] = useState(editing?.question || '')
  const [intensity, setIntensity] = useState<1|2|3>(editing?.intensity || 2)
  const [note, setNote] = useState(editing?.note || '')

  const handleSave = () => {
    if (!question.trim()) return
    if (editing) {
      updateCuriosity(editing.id, { question: question.trim(), intensity, note: note.trim() || undefined })
      toast('Updated.', 'success')
    } else {
      addCuriosity({ question: question.trim(), intensity, resolved: false, note: note.trim() || undefined })
      toast('Curiosity noted. No action needed.', 'info')
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Curiosity' : 'I Want To Know'} subtitle="Write it down so you don't act on it." size="sm">
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="cq-question">What do you want to know?</label>
          <textarea
            id="cq-question"
            className="textarea h-28"
            placeholder="e.g. Is she okay? Is she seeing someone?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="label">How strong is this feeling?</label>
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((i) => (
              <button
                key={i}
                onClick={() => setIntensity(i)}
                className="flex-1 py-2 rounded-lg text-xs font-medium border transition-all"
                style={intensity === i
                  ? { backgroundColor: INTENSITY_COLORS[i] + '20', borderColor: INTENSITY_COLORS[i], color: INTENSITY_COLORS[i] }
                  : { borderColor: '#1f2d45', color: '#64748b', backgroundColor: '#161e2e' }
                }
              >
                {INTENSITY_LABELS[i]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="cq-note">Note to yourself (optional)</label>
          <input
            id="cq-note"
            className="input"
            placeholder="Why does this matter to you?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!question.trim()} onClick={handleSave}>
            {editing ? 'Update' : 'Note It'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function CuriosityPage() {
  const { curiosityEntries, updateCuriosity, deleteCuriosity, toast } = useApp()
  const [writeOpen, setWriteOpen] = useState(false)
  const [editing, setEditing] = useState<CuriosityEntry | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active')

  const filtered = useMemo(() => {
    if (filter === 'active') return curiosityEntries.filter((e) => !e.resolved)
    if (filter === 'resolved') return curiosityEntries.filter((e) => e.resolved)
    return curiosityEntries
  }, [curiosityEntries, filter])

  const activeCount = curiosityEntries.filter((e) => !e.resolved).length

  const handleToggle = (id: string) => {
    const e = curiosityEntries.find((x) => x.id === id)
    if (!e) return
    updateCuriosity(id, { resolved: !e.resolved })
    toast(e.resolved ? 'Marked active.' : 'Marked as resolved.', 'success')
  }

  const handleDelete = (id: string) => {
    deleteCuriosity(id)
    toast('Entry deleted.', 'info')
  }

  const openEdit = (e: CuriosityEntry) => { setEditing(e); setWriteOpen(true) }
  const handleClose = () => { setWriteOpen(false); setEditing(null) }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">I Want To Know</h1>
          <p className="page-subtitle">
            {activeCount} active {activeCount === 1 ? 'curiosity' : 'curiosities'} — noted, not acted on
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setWriteOpen(true) }}>
          + Add
        </button>
      </div>

      {/* Context card */}
      <div className="card border-rose-900/20 bg-rose-950/10 mb-6">
        <p className="text-xs text-slate-400 leading-relaxed">
          This section is a container for your curiosity — not a permission to check. Writing it here means you chose awareness over action. That matters.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5">
        {(['active', 'all', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
              filter === f
                ? 'bg-purple-800/40 border-purple-600 text-purple-300'
                : 'border-surface-border text-slate-500 hover:text-slate-300 bg-surface-card'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
          title={filter === 'resolved' ? 'No resolved entries' : 'No active curiosities'}
          description={filter === 'active' ? 'When you feel curious about her, write it here instead of acting on it.' : undefined}
          action={filter !== 'resolved' ? <button className="btn-primary" onClick={() => setWriteOpen(true)}>Note a Curiosity</button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <CuriosityCard key={e.id} entry={e} onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <WriteModal open={writeOpen} onClose={handleClose} editing={editing} />
    </div>
  )
}
