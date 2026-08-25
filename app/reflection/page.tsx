'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { formatRelative } from '@/lib/utils'
import { REFLECTION_PROMPTS, type ReflectionPrompt } from '@/types'
import Modal from '@/components/ui/Modal'

const CATEGORY_LABELS = {
  identity: 'Identity',
  grief: 'Grief',
  growth: 'Growth',
  clarity: 'Clarity',
} as const

const CATEGORY_COLORS = {
  identity: '#9b7ad4',
  grief: '#ec4899',
  growth: '#22c55e',
  clarity: '#3b82f6',
} as const

function ReflectionCard({
  prompt,
  existingAnswer,
  onWrite,
}: {
  prompt: ReflectionPrompt
  existingAnswer?: string
  onWrite: (prompt: ReflectionPrompt, existing?: string) => void
}) {
  return (
    <article
      className={`card-hover cursor-pointer transition-all ${existingAnswer ? 'border-l-2' : ''}`}
      style={existingAnswer ? { borderLeftColor: CATEGORY_COLORS[prompt.category] } : {}}
      onClick={() => onWrite(prompt, existingAnswer)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className="badge text-[10px] flex-shrink-0"
          style={{
            backgroundColor: CATEGORY_COLORS[prompt.category] + '15',
            color: CATEGORY_COLORS[prompt.category],
          }}
        >
          {CATEGORY_LABELS[prompt.category]}
        </span>
        {existingAnswer ? (
          <span className="flex items-center gap-1 text-[10px] text-green-500">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Answered
          </span>
        ) : (
          <span className="text-[10px] text-slate-600">Tap to reflect</span>
        )}
      </div>

      <p className="text-sm font-medium text-slate-200 leading-relaxed mb-2">
        {prompt.question}
      </p>

      {existingAnswer && (
        <p className="text-xs text-slate-500 line-clamp-2 italic leading-relaxed">
          &ldquo;{existingAnswer}&rdquo;
        </p>
      )}
    </article>
  )
}

function WriteModal({
  open,
  onClose,
  prompt,
  existing,
}: {
  open: boolean
  onClose: () => void
  prompt: ReflectionPrompt | null
  existing?: string
}) {
  const { saveReflection, toast } = useApp()
  const [answer, setAnswer] = useState(existing || '')

  const handleSave = () => {
    if (!prompt || !answer.trim()) return
    saveReflection(prompt.id, answer.trim())
    toast('Reflection saved.', 'success')
    onClose()
  }

  if (!prompt) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reflection"
      size="md"
    >
      <div className="space-y-4">
        <div
          className="rounded-xl px-4 py-4 border"
          style={{
            backgroundColor: CATEGORY_COLORS[prompt.category] + '08',
            borderColor: CATEGORY_COLORS[prompt.category] + '30',
          }}
        >
          <span
            className="badge text-[10px] mb-2 inline-block"
            style={{
              backgroundColor: CATEGORY_COLORS[prompt.category] + '15',
              color: CATEGORY_COLORS[prompt.category],
            }}
          >
            {CATEGORY_LABELS[prompt.category]}
          </span>
          <p className="text-sm font-medium text-slate-200 leading-relaxed">
            {prompt.question}
          </p>
        </div>

        <div>
          <label className="label" htmlFor="reflection-text">
            Your answer
          </label>
          <textarea
            id="reflection-text"
            className="textarea h-44"
            placeholder="Be honest. No one else reads this."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            disabled={!answer.trim()}
            onClick={handleSave}
          >
            {existing ? 'Update' : 'Save Reflection'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function ReflectionPage() {
  const { reflections } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [activePrompt, setActivePrompt] = useState<ReflectionPrompt | null>(null)
  const [activeExisting, setActiveExisting] = useState<string | undefined>()
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const answeredCount = reflections.length

  const filteredPrompts = useMemo(() => {
    const answeredIds = new Set(reflections.map((r) => r.promptId))
    if (filterCategory === 'all') return REFLECTION_PROMPTS
    if (filterCategory === 'answered') return REFLECTION_PROMPTS.filter((p) => answeredIds.has(p.id))
    if (filterCategory === 'unanswered') return REFLECTION_PROMPTS.filter((p) => !answeredIds.has(p.id))
    return REFLECTION_PROMPTS.filter((p) => p.category === filterCategory)
  }, [filterCategory, reflections])

  const handleWrite = (prompt: ReflectionPrompt, existing?: string) => {
    setActivePrompt(prompt)
    setActiveExisting(existing)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setActivePrompt(null)
    setActiveExisting(undefined)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Reflection</h1>
        <p className="page-subtitle">
          {answeredCount} of {REFLECTION_PROMPTS.length} questions answered
        </p>
      </div>

      {/* Progress bar */}
      <div className="card mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Progress</span>
          <span className="tabular-nums">{answeredCount}/{REFLECTION_PROMPTS.length}</span>
        </div>
        <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${(answeredCount / REFLECTION_PROMPTS.length) * 100}%` }}
          />
        </div>
        {answeredCount === REFLECTION_PROMPTS.length && (
          <p className="text-xs text-purple-400 mt-2 font-medium">
            You&apos;ve answered everything. That takes courage.
          </p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {['all', 'unanswered', 'answered', 'identity', 'grief', 'growth', 'clarity'].map((f) => {
          const isActive = filterCategory === f
          const color = f in CATEGORY_COLORS ? CATEGORY_COLORS[f as keyof typeof CATEGORY_COLORS] : undefined
          return (
            <button
              key={f}
              onClick={() => setFilterCategory(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize"
              style={
                isActive && color
                  ? { backgroundColor: color + '15', borderColor: color, color }
                  : isActive
                  ? { backgroundColor: '#5b3591' + '30', borderColor: '#7c52b8', color: '#b89ee0' }
                  : { borderColor: '#1f2d45', color: '#64748b', backgroundColor: '#161e2e' }
              }
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-slate-500">No prompts in this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredPrompts.map((prompt) => {
            const existing = reflections.find((r) => r.promptId === prompt.id)
            return (
              <ReflectionCard
                key={prompt.id}
                prompt={prompt}
                existingAnswer={existing?.answer}
                onWrite={handleWrite}
              />
            )
          })}
        </div>
      )}

      {/* Recent reflections */}
      {reflections.length > 0 && (
        <div className="mt-8">
          <h2 className="section-title mb-4">Recently Written</h2>
          <div className="space-y-3">
            {[...reflections]
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 3)
              .map((r) => {
                const prompt = REFLECTION_PROMPTS.find((p) => p.id === r.promptId)
                if (!prompt) return null
                return (
                  <div
                    key={r.id}
                    className="card-hover cursor-pointer"
                    onClick={() => handleWrite(prompt, r.answer)}
                  >
                    <p className="text-xs text-slate-500 mb-1">{prompt.question}</p>
                    <p className="text-sm text-slate-300 line-clamp-2 italic">
                      &ldquo;{r.answer}&rdquo;
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1.5">
                      {formatRelative(r.updatedAt)}
                    </p>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      <WriteModal
        open={modalOpen}
        onClose={handleClose}
        prompt={activePrompt}
        existing={activeExisting}
      />
    </div>
  )
}
