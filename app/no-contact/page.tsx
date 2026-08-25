'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useNoContactTimer } from '@/hooks/useNoContact'
import { formatDate } from '@/lib/utils'
import Modal from '@/components/ui/Modal'

const MILESTONES = [
  { days: 7, label: '1 Week', description: 'The hardest part is behind you.' },
  { days: 14, label: '2 Weeks', description: 'Your brain is starting to rewire.' },
  { days: 30, label: '1 Month', description: 'You proved you can do this.' },
  { days: 60, label: '2 Months', description: 'The fog is lifting.' },
  { days: 90, label: '3 Months', description: 'You\'re building a new normal.' },
  { days: 180, label: '6 Months', description: 'You\'re healing from the inside out.' },
  { days: 365, label: '1 Year', description: 'Extraordinary. You chose yourself.' },
]

function TimerDisplay({ days, hours, minutes, seconds }: { days: number; hours: number; minutes: number; seconds: number }) {
  return (
    <div className="flex items-end justify-center gap-4 py-8">
      {[
        { value: days, unit: 'Days' },
        { value: hours, unit: 'Hours' },
        { value: minutes, unit: 'Minutes' },
        { value: seconds, unit: 'Seconds' },
      ].map(({ value, unit }, i) => (
        <div key={unit} className="text-center">
          {i > 0 && (
            <span className="text-3xl font-light text-slate-600 mr-4 mb-5 inline-block">:</span>
          )}
          <p className="text-5xl sm:text-6xl font-bold text-slate-100 tabular-nums leading-none">
            {unit === 'Days' ? value : String(value).padStart(2, '0')}
          </p>
          <p className="text-xs text-slate-600 mt-2 uppercase tracking-widest">{unit}</p>
        </div>
      ))}
    </div>
  )
}

function SetupModal({ open, onClose, existing }: {
  open: boolean
  onClose: () => void
  existing: { startDate: string } | null
}) {
  const { setUser, user, toast } = useApp()
  const [date, setDate] = useState(
    existing?.startDate
      ? new Date(existing.startDate).toISOString().slice(0, 16)
      : ''
  )

  const handleSave = () => {
    if (!date) return
    setUser({
      ...user,
      noContact: { startDate: new Date(date).toISOString(), name: user.name },
    })
    toast('No contact timer updated.', 'success')
    onClose()
  }

  const handleReset = () => {
    setUser({ ...user, noContact: null })
    toast('No contact timer reset.', 'info')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="No Contact Timer" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-400">Set the date and time of your last contact.</p>
        <div>
          <label className="label" htmlFor="nc-date">Last contact date &amp; time</label>
          <input
            id="nc-date"
            type="datetime-local"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().slice(0, 16)}
          />
        </div>
        <div className="flex justify-between gap-2">
          {existing && (
            <button className="btn-danger" onClick={handleReset}>Reset Timer</button>
          )}
          <div className="flex gap-2 ml-auto">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" disabled={!date} onClick={handleSave}>
              {existing ? 'Update' : 'Start Timer'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function NoContactPage() {
  const { user } = useApp()
  const duration = useNoContactTimer(user.noContact)
  const [setupOpen, setSetupOpen] = useState(false)

  const nc = user.noContact

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">No Contact</h1>
          <p className="page-subtitle">Every day of silence is a choice for yourself</p>
        </div>
        <button className="btn-secondary" onClick={() => setSetupOpen(true)}>
          {nc ? 'Edit Timer' : 'Start Timer'}
        </button>
      </div>

      {!nc ? (
        <div className="card text-center py-16">
          <p className="text-slate-400 mb-2 text-sm">Timer not started yet.</p>
          <p className="text-slate-600 text-xs mb-6">When did you last speak to her?</p>
          <button className="btn-primary" onClick={() => setSetupOpen(true)}>Set Last Contact Date</button>
        </div>
      ) : (
        <>
          {/* Main timer */}
          <div className="card border-purple-800/30 bg-gradient-to-br from-surface-card to-purple-950/10 mb-6">
            <div className="text-center mb-2">
              <p className="section-title">No contact since</p>
              <p className="text-sm text-purple-400 mt-1">{formatDate(nc.startDate)}</p>
            </div>
            <TimerDisplay
              days={duration.days}
              hours={duration.hours}
              minutes={duration.minutes}
              seconds={duration.seconds}
            />
            <p className="text-center text-xs text-slate-600">
              {duration.total === 0 ? 'Starting now.' : 'Keep going.'}
            </p>
          </div>

          {/* Milestones */}
          <div className="card">
            <h2 className="section-title mb-5">Milestones</h2>
            <div className="space-y-3">
              {MILESTONES.map((m) => {
                const achieved = duration.days >= m.days
                const isCurrent = !achieved && (
                  MILESTONES.find((x) => x.days > duration.days)?.days === m.days
                )

                return (
                  <div
                    key={m.days}
                    className={`flex items-center gap-4 py-3 px-4 rounded-xl border transition-all ${
                      achieved
                        ? 'bg-purple-900/20 border-purple-700/40'
                        : isCurrent
                        ? 'bg-surface-hover border-surface-border border-dashed'
                        : 'border-transparent opacity-40'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      achieved ? 'bg-purple-700' : 'bg-surface-muted'
                    }`}>
                      {achieved ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-600">{m.days}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${achieved ? 'text-slate-200' : 'text-slate-500'}`}>
                          {m.label}
                        </p>
                        {isCurrent && (
                          <span className="badge bg-purple-900/40 text-purple-400 text-[10px]">Next</span>
                        )}
                      </div>
                      {(achieved || isCurrent) && (
                        <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                      )}
                    </div>

                    {isCurrent && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-600 tabular-nums">{m.days - duration.days}d left</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      <SetupModal open={setupOpen} onClose={() => setSetupOpen(false)} existing={nc} />
    </div>
  )
}
