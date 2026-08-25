'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { formatDate } from '@/lib/utils'
import {
  MEMORY_CATEGORY_LABELS,
  type Memory,
  type MemoryCategory,
} from '@/types'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const CATEGORY_COLORS: Record<MemoryCategory, string> = {
  first_time: '#9b7ad4',
  special_day: '#ec4899',
  everyday: '#64748b',
  conflict: '#ef4444',
  milestone: '#eab308',
  last_time: '#6b7280',
}

function CategoryBadge({ category }: { category: MemoryCategory }) {
  return (
    <span
      className="badge text-[10px]"
      style={{
        backgroundColor: CATEGORY_COLORS[category] + '20',
        color: CATEGORY_COLORS[category],
      }}
    >
      {MEMORY_CATEGORY_LABELS[category]}
    </span>
  )
}

function MemoryFormModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing: Memory | null
}) {
  const { addMemory, updateMemory, toast } = useApp()
  const [title, setTitle] = useState(editing?.title || '')
  const [description, setDescription] = useState(editing?.description || '')
  const [date, setDate] = useState(editing?.date || '')
  const [category, setCategory] = useState<MemoryCategory>(
    editing?.category || 'everyday'
  )

  const handleSave = () => {
    if (!title.trim() || !date) return
    if (editing) {
      updateMemory(editing.id, {
        title: title.trim(),
        description: description.trim(),
        date,
        category,
      })
      toast('Memory updated.', 'success')
    } else {
      addMemory({
        title: title.trim(),
        description: description.trim(),
        date,
        category,
      })
      toast('Memory added to your timeline.', 'success')
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Memory' : 'Add a Memory'}
      subtitle="Every moment that shaped you deserves to be remembered honestly."
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="mem-title">
            Title
          </label>
          <input
            id="mem-title"
            className="input"
            placeholder="What happened?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="label" htmlFor="mem-date">
            Date
          </label>
          <input
            id="mem-date"
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(MEMORY_CATEGORY_LABELS) as MemoryCategory[]).map(
              (c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left"
                  style={
                    category === c
                      ? {
                          backgroundColor: CATEGORY_COLORS[c] + '20',
                          borderColor: CATEGORY_COLORS[c],
                          color: CATEGORY_COLORS[c],
                        }
                      : {
                          borderColor: '#1f2d45',
                          color: '#64748b',
                          backgroundColor: '#161e2e',
                        }
                  }
                >
                  {MEMORY_CATEGORY_LABELS[c]}
                </button>
              )
            )}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="mem-desc">
            Description (optional)
          </label>
          <textarea
            id="mem-desc"
            className="textarea h-32"
            placeholder="Describe what you remember..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            disabled={!title.trim() || !date}
            onClick={handleSave}
          >
            {editing ? 'Update' : 'Add Memory'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function TimelineItem({
  memory,
  isLast,
  onEdit,
  onDelete,
}: {
  memory: Memory
  isLast: boolean
  onEdit: (m: Memory) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <div className="flex gap-4 animate-slide-up">
        {/* Timeline line + dot */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div
            className="w-3 h-3 rounded-full border-2 mt-1 flex-shrink-0"
            style={{
              backgroundColor: CATEGORY_COLORS[memory.category] + '30',
              borderColor: CATEGORY_COLORS[memory.category],
            }}
          />
          {!isLast && (
            <div className="w-px flex-1 bg-surface-border mt-1 min-h-[2rem]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pb-6">
          <div className="card-hover cursor-pointer" onClick={() => setExpanded(true)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <CategoryBadge category={memory.category} />
                  <span className="text-[11px] text-slate-600">
                    {formatDate(memory.date)}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-slate-200">
                  {memory.title}
                </h3>
                {memory.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {memory.description}
                  </p>
                )}
              </div>
              <div
                className="flex items-center gap-1 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="btn-ghost p-1.5"
                  onClick={() => onEdit(memory)}
                  aria-label="Edit"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className="btn-ghost p-1.5 text-red-500/60 hover:text-red-400"
                  onClick={() => setConfirmOpen(true)}
                  aria-label="Delete"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Read modal */}
      <Modal open={expanded} onClose={() => setExpanded(false)} title={memory.title} size="md">
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={memory.category} />
            <span className="text-xs text-slate-600">{formatDate(memory.date)}</span>
          </div>
          {memory.description ? (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {memory.description}
            </p>
          ) : (
            <p className="text-sm text-slate-600 italic">No description added.</p>
          )}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => { setExpanded(false); onEdit(memory) }}>
              Edit
            </button>
            <button className="btn-secondary" onClick={() => setExpanded(false)}>
              Close
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => onDelete(memory.id)}
        message="This memory will be permanently removed from your timeline."
      />
    </>
  )
}

export default function MemoriesPage() {
  const { memories, deleteMemory, toast } = useApp()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Memory | null>(null)
  const [filterCategory, setFilterCategory] = useState<MemoryCategory | 'all'>('all')

  const filtered = useMemo(() => {
    if (filterCategory === 'all') return memories
    return memories.filter((m) => m.category === filterCategory)
  }, [memories, filterCategory])

  // Group by year
  const grouped = useMemo(() => {
    const map: Record<string, Memory[]> = {}
    filtered.forEach((m) => {
      const year = new Date(m.date).getFullYear().toString()
      if (!map[year]) map[year] = []
      map[year].push(m)
    })
    return map
  }, [filtered])

  const years = Object.keys(grouped).sort((a, b) => Number(a) - Number(b))

  const handleDelete = (id: string) => {
    deleteMemory(id)
    toast('Memory removed.', 'info')
  }

  const openEdit = (m: Memory) => {
    setEditing(m)
    setFormOpen(true)
  }

  const handleClose = () => {
    setFormOpen(false)
    setEditing(null)
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Memories</h1>
          <p className="page-subtitle">
            {memories.length} {memories.length === 1 ? 'memory' : 'memories'} on your timeline
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true) }}>
          + Add Memory
        </button>
      </div>

      {/* Context */}
      <div className="card border-purple-800/20 bg-purple-950/10 mb-6">
        <p className="text-xs text-slate-400 leading-relaxed">
          Your relationship had real moments — good and hard. This timeline isn&apos;t about idealizing or condemning. It&apos;s about seeing it clearly.
        </p>
      </div>

      {/* Category filter */}
      {memories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filterCategory === 'all'
                ? 'bg-purple-800/40 border-purple-600 text-purple-300'
                : 'border-surface-border text-slate-500 bg-surface-card hover:text-slate-300'
            }`}
          >
            All
          </button>
          {(Object.keys(MEMORY_CATEGORY_LABELS) as MemoryCategory[]).map((c) => {
            const count = memories.filter((m) => m.category === c).length
            if (count === 0) return null
            return (
              <button
                key={c}
                onClick={() => setFilterCategory(filterCategory === c ? 'all' : c)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                style={
                  filterCategory === c
                    ? {
                        backgroundColor: CATEGORY_COLORS[c] + '20',
                        borderColor: CATEGORY_COLORS[c],
                        color: CATEGORY_COLORS[c],
                      }
                    : {
                        borderColor: '#1f2d45',
                        color: '#64748b',
                        backgroundColor: '#161e2e',
                      }
                }
              >
                {MEMORY_CATEGORY_LABELS[c]} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Timeline */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
          title={memories.length === 0 ? 'No memories yet' : 'No memories in this category'}
          description={
            memories.length === 0
              ? 'Add the moments that defined your relationship — the firsts, the special days, the everyday ones.'
              : undefined
          }
          action={
            memories.length === 0 ? (
              <button className="btn-primary" onClick={() => setFormOpen(true)}>
                Add First Memory
              </button>
            ) : undefined
          }
        />
      ) : (
        <div>
          {years.map((year) => (
            <section key={year} className="mb-8">
              <h2 className="section-title mb-5">{year}</h2>
              <div>
                {grouped[year].map((m, i) => (
                  <TimelineItem
                    key={m.id}
                    memory={m}
                    isLast={i === grouped[year].length - 1}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <MemoryFormModal open={formOpen} onClose={handleClose} editing={editing} />
    </div>
  )
}
