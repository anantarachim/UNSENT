'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { formatDate, formatRelative, todayISO } from '@/lib/utils'
import { MOOD_LABELS, MOOD_COLORS, type MoodLevel, type DiaryEntry } from '@/types'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const DAILY_PROMPTS = [
  'What are you feeling right now, without filtering it?',
  'What\'s one thing you are proud of yourself for today?',
  'What did you do today that was just for you?',
  'What thought kept coming back to you today?',
  'Where in your body do you feel the grief today?',
  'What would make tomorrow slightly better?',
  'Who showed up for you today, even in a small way?',
]

// ─── Mood badge ───────────────────────────────────────────────────────────────
function MoodBadge({ mood }: { mood: MoodLevel }) {
  return (
    <span
      className="badge text-[10px] font-medium"
      style={{ backgroundColor: MOOD_COLORS[mood] + '20', color: MOOD_COLORS[mood] }}
    >
      {MOOD_LABELS[mood]}
    </span>
  )
}

// ─── Entry card ───────────────────────────────────────────────────────────────
function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: DiaryEntry
  onEdit: (e: DiaryEntry) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <article
        className="card-hover cursor-pointer animate-slide-up"
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <MoodBadge mood={entry.mood} />
              <span className="text-[11px] text-slate-600">{formatRelative(entry.createdAt)}</span>
            </div>
            <h3 className="text-sm font-medium text-slate-200 mb-1">{entry.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{entry.content}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn-ghost p-1.5"
              onClick={() => onEdit(entry)}
              aria-label="Edit entry"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              className="btn-ghost p-1.5 text-red-500/60 hover:text-red-400"
              onClick={() => setConfirmOpen(true)}
              aria-label="Delete entry"
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

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {entry.tags.map((t) => (
              <span key={t} className="badge bg-surface-muted text-slate-500 text-[10px]">#{t}</span>
            ))}
          </div>
        )}
      </article>

      {/* Read modal */}
      <Modal open={expanded} onClose={() => setExpanded(false)} title={entry.title} size="md">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <MoodBadge mood={entry.mood} />
            <span className="text-xs text-slate-600">{formatDate(entry.createdAt)}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2 border-t border-surface-border">
              {entry.tags.map((t) => (
                <span key={t} className="badge bg-surface-muted text-slate-500 text-[10px]">#{t}</span>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => { setExpanded(false); onEdit(entry) }}>Edit</button>
            <button className="btn-secondary" onClick={() => setExpanded(false)}>Close</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => onDelete(entry.id)}
        message="This entry will be permanently deleted."
      />
    </>
  )
}

// ─── Write / Edit modal ───────────────────────────────────────────────────────
function WriteModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing: DiaryEntry | null
}) {
  const { addDiaryEntry, updateDiaryEntry, toast } = useApp()
  const [title, setTitle] = useState(editing?.title || '')
  const [content, setContent] = useState(editing?.content || '')
  const [mood, setMood] = useState<MoodLevel>(editing?.mood || 3)
  const [tagsRaw, setTagsRaw] = useState(editing?.tags.join(', ') || '')

  const todayPrompt = DAILY_PROMPTS[new Date().getDay() % DAILY_PROMPTS.length]

  const handleSave = () => {
    if (!content.trim()) return
    const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    const defaultTitle = `Entry — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

    if (editing) {
      updateDiaryEntry(editing.id, { title: title.trim() || defaultTitle, content: content.trim(), mood, tags })
      toast('Entry updated.', 'success')
    } else {
      addDiaryEntry({ date: todayISO(), mood, title: title.trim() || defaultTitle, content: content.trim(), tags })
      toast('Entry saved.', 'success')
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Entry' : 'New Entry'}
      size="lg"
    >
      <div className="space-y-4">
        {!editing && (
          <div className="bg-surface-hover rounded-lg px-4 py-3 border border-surface-border">
            <p className="text-xs text-slate-500 italic">&ldquo;{todayPrompt}&rdquo;</p>
          </div>
        )}

        <div>
          <label className="label" htmlFor="diary-title">Title (optional)</label>
          <input
            id="diary-title"
            className="input"
            placeholder="Give this entry a name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Mood</label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as MoodLevel[]).map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className="flex-1 py-2.5 rounded-lg text-xs font-semibold border transition-all duration-150"
                style={
                  mood === m
                    ? { backgroundColor: MOOD_COLORS[m] + '25', borderColor: MOOD_COLORS[m], color: MOOD_COLORS[m] }
                    : { borderColor: '#1f2d45', color: '#64748b', backgroundColor: '#161e2e' }
                }
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
            className="textarea h-48"
            placeholder="Write freely. No one else will read this."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus={!editing}
          />
        </div>

        <div>
          <label className="label" htmlFor="diary-tags">Tags (comma separated, optional)</label>
          <input
            id="diary-tags"
            className="input"
            placeholder="e.g. grief, progress, sleep"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!content.trim()} onClick={handleSave}>
            {editing ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DiaryPage() {
  const { diaryEntries, deleteDiaryEntry, toast } = useApp()
  const [writeOpen, setWriteOpen] = useState(false)
  const [editing, setEditing] = useState<DiaryEntry | null>(null)
  const [filterMood, setFilterMood] = useState<MoodLevel | 0>(0)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return diaryEntries
      .filter((e) => filterMood === 0 || e.mood === filterMood)
      .filter((e) =>
        !search.trim() ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.content.toLowerCase().includes(search.toLowerCase())
      )
  }, [diaryEntries, filterMood, search])

  // Group by month
  const grouped = useMemo(() => {
    const map: Record<string, DiaryEntry[]> = {}
    filtered.forEach((e) => {
      const key = new Date(e.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    return map
  }, [filtered])

  const handleDelete = (id: string) => {
    deleteDiaryEntry(id)
    toast('Entry deleted.', 'info')
  }

  const openEdit = (e: DiaryEntry) => { setEditing(e); setWriteOpen(true) }
  const handleClose = () => { setWriteOpen(false); setEditing(null) }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Diary</h1>
          <p className="page-subtitle">{diaryEntries.length} {diaryEntries.length === 1 ? 'entry' : 'entries'} written</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setWriteOpen(true) }}>
          + New Entry
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <input
          className="input max-w-xs"
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilterMood(0)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filterMood === 0 ? 'bg-purple-800/40 border-purple-600 text-purple-300' : 'border-surface-border text-slate-500 hover:text-slate-300 bg-surface-card'}`}
          >
            All
          </button>
          {([1, 2, 3, 4, 5] as MoodLevel[]).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMood(filterMood === m ? 0 : m)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={filterMood === m
                ? { backgroundColor: MOOD_COLORS[m] + '25', borderColor: MOOD_COLORS[m], color: MOOD_COLORS[m] }
                : { borderColor: '#1f2d45', color: '#64748b', backgroundColor: '#161e2e' }
              }
              title={MOOD_LABELS[m]}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          }
          title={diaryEntries.length === 0 ? 'No entries yet' : 'No entries match your filter'}
          description={diaryEntries.length === 0 ? 'Write your first diary entry. There\'s no right way.' : 'Try a different search or mood filter.'}
          action={
            diaryEntries.length === 0 ? (
              <button className="btn-primary" onClick={() => setWriteOpen(true)}>Write First Entry</button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, entries]) => (
            <section key={month}>
              <h2 className="section-title mb-3">{month}</h2>
              <div className="space-y-3">
                {entries.map((e) => (
                  <EntryCard key={e.id} entry={e} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <WriteModal open={writeOpen} onClose={handleClose} editing={editing} />
    </div>
  )
}
