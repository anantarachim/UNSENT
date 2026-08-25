'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { formatDate, formatRelative } from '@/lib/utils'
import { MESSAGE_EMOTION_LABELS, MESSAGE_EMOTION_COLORS, type MessageEmotion, type UnsentMessage } from '@/types'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

function EmotionBadge({ emotion }: { emotion: MessageEmotion }) {
  return (
    <span
      className="badge text-[10px]"
      style={{ backgroundColor: MESSAGE_EMOTION_COLORS[emotion] + '20', color: MESSAGE_EMOTION_COLORS[emotion] }}
    >
      {MESSAGE_EMOTION_LABELS[emotion]}
    </span>
  )
}

function MessageCard({ msg, onDelete }: { msg: UnsentMessage; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <article
        className="card-hover cursor-pointer"
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <EmotionBadge emotion={msg.emotion} />
              <span className="text-[11px] text-slate-600">{formatRelative(msg.createdAt)}</span>
            </div>
            {msg.subject && (
              <p className="text-sm font-medium text-slate-200 mb-1">{msg.subject}</p>
            )}
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{msg.content}</p>
          </div>
          <button
            className="btn-ghost p-1.5 text-red-500/40 hover:text-red-400 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); setConfirmOpen(true) }}
            aria-label="Delete message"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </article>

      {/* Read modal */}
      <Modal open={expanded} onClose={() => setExpanded(false)} title={msg.subject || 'Unsent Message'} size="md">
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <EmotionBadge emotion={msg.emotion} />
            <span className="text-xs text-slate-600">{formatDate(msg.createdAt)}</span>
          </div>
          <div className="bg-surface-hover rounded-xl px-5 py-4 border border-surface-border">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-serif italic">
              {msg.content}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-danger text-xs" onClick={() => { setExpanded(false); setConfirmOpen(true) }}>
              Delete
            </button>
            <button className="btn-secondary" onClick={() => setExpanded(false)}>Close</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => onDelete(msg.id)}
        message="This message will be permanently deleted."
      />
    </>
  )
}

function WriteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addUnsentMessage, toast } = useApp()
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [emotion, setEmotion] = useState<MessageEmotion>('longing')

  const handleSave = () => {
    if (!content.trim()) return
    addUnsentMessage({ content: content.trim(), subject: subject.trim() || undefined, emotion })
    toast('Message written. It stays here.', 'info')
    setSubject('')
    setContent('')
    setEmotion('longing')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Write an Unsent Message" subtitle="This will never be sent. Say what you need to say." size="lg">
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="um-subject">Subject (optional)</label>
          <input id="um-subject" className="input" placeholder="What is this message about?" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <label className="label">How are you feeling while writing this?</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(MESSAGE_EMOTION_LABELS) as MessageEmotion[]).map((e) => (
              <button
                key={e}
                onClick={() => setEmotion(e)}
                className="px-3 py-2 rounded-lg text-xs font-medium border transition-all"
                style={emotion === e
                  ? { backgroundColor: MESSAGE_EMOTION_COLORS[e] + '20', borderColor: MESSAGE_EMOTION_COLORS[e], color: MESSAGE_EMOTION_COLORS[e] }
                  : { borderColor: '#1f2d45', color: '#64748b', backgroundColor: '#161e2e' }
                }
              >
                {MESSAGE_EMOTION_LABELS[e]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="um-content">Your message</label>
          <textarea
            id="um-content"
            className="textarea h-52 font-serif text-sm leading-relaxed"
            placeholder="Dear her..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!content.trim()} onClick={handleSave}>Write It</button>
        </div>
      </div>
    </Modal>
  )
}

export default function UnsentPage() {
  const { unsentMessages, deleteUnsentMessage, toast } = useApp()
  const [writeOpen, setWriteOpen] = useState(false)
  const [filterEmotion, setFilterEmotion] = useState<MessageEmotion | 'all'>('all')

  const filtered = useMemo(() => {
    if (filterEmotion === 'all') return unsentMessages
    return unsentMessages.filter((m) => m.emotion === filterEmotion)
  }, [unsentMessages, filterEmotion])

  const handleDelete = (id: string) => {
    deleteUnsentMessage(id)
    toast('Message deleted.', 'info')
  }

  // Emotion counts
  const counts = useMemo(() => {
    return (Object.keys(MESSAGE_EMOTION_LABELS) as MessageEmotion[]).map((e) => ({
      emotion: e,
      count: unsentMessages.filter((m) => m.emotion === e).length,
    }))
  }, [unsentMessages])

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Unsent Messages</h1>
          <p className="page-subtitle">{unsentMessages.length} {unsentMessages.length === 1 ? 'message' : 'messages'} written, never sent</p>
        </div>
        <button className="btn-primary" onClick={() => setWriteOpen(true)}>+ Write Message</button>
      </div>

      {/* Context */}
      <div className="card border-rose-900/20 bg-rose-950/10 mb-6">
        <p className="text-xs text-slate-400 leading-relaxed">
          Writing unsent messages is a form of emotional release. It helps you process feelings without the consequences of sending them. Say everything you need to say — anger, grief, love, gratitude.
        </p>
      </div>

      {/* Emotion filter */}
      {unsentMessages.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          <button
            onClick={() => setFilterEmotion('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filterEmotion === 'all' ? 'bg-purple-800/40 border-purple-600 text-purple-300' : 'border-surface-border text-slate-500 bg-surface-card hover:text-slate-300'}`}
          >
            All ({unsentMessages.length})
          </button>
          {counts.filter((c) => c.count > 0).map(({ emotion, count }) => (
            <button
              key={emotion}
              onClick={() => setFilterEmotion(filterEmotion === emotion ? 'all' : emotion)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={filterEmotion === emotion
                ? { backgroundColor: MESSAGE_EMOTION_COLORS[emotion] + '20', borderColor: MESSAGE_EMOTION_COLORS[emotion], color: MESSAGE_EMOTION_COLORS[emotion] }
                : { borderColor: '#1f2d45', color: '#64748b', backgroundColor: '#161e2e' }
              }
            >
              {MESSAGE_EMOTION_LABELS[emotion]} ({count})
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
            </svg>
          }
          title={unsentMessages.length === 0 ? 'No messages yet' : 'No messages with this emotion'}
          description="Write what you can't say. It doesn't need to be sent to matter."
          action={
            unsentMessages.length === 0
              ? <button className="btn-primary" onClick={() => setWriteOpen(true)}>Write First Message</button>
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <MessageCard key={m.id} msg={m} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <WriteModal open={writeOpen} onClose={() => setWriteOpen(false)} />
    </div>
  )
}
