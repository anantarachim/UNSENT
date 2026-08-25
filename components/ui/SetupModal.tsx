'use client'

import { useState } from 'react'
import Modal from './Modal'
import { useApp } from '@/context/AppContext'

export default function SetupModal() {
  const { setUser, toast } = useApp()
  const [name, setName] = useState('')
  const [ncDate, setNcDate] = useState('')
  const [step, setStep] = useState(1)

  const handleFinish = () => {
    if (!name.trim()) return
    setUser({
      name: name.trim(),
      setupComplete: true,
      noContact: ncDate ? { startDate: new Date(ncDate).toISOString(), name: name.trim() } : null,
      theme: 'dark',
    })
    toast(`Welcome, ${name.trim()}. Your space is ready.`, 'success')
  }

  return (
    <Modal open={true} onClose={() => {}} title="Welcome to UNSENT" size="md">
      {step === 1 && (
        <div className="space-y-5 animate-fade-in">
          <p className="text-sm text-slate-400 leading-relaxed">
            This is a private space for you to process, heal, and grow — at your own pace.
            Nothing leaves this device.
          </p>
          <div>
            <label className="label" htmlFor="setup-name">What should we call you?</label>
            <input
              id="setup-name"
              className="input"
              placeholder="Your name or a nickname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) setStep(2) }}
              autoFocus
            />
          </div>
          <div className="flex justify-end">
            <button
              className="btn-primary"
              disabled={!name.trim()}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          <p className="text-sm text-slate-400 leading-relaxed">
            When did you last contact her? This starts your No Contact counter.
            You can skip this and set it later.
          </p>
          <div>
            <label className="label" htmlFor="setup-nc">Last contact date &amp; time</label>
            <input
              id="setup-nc"
              type="datetime-local"
              className="input"
              value={ncDate}
              onChange={(e) => setNcDate(e.target.value)}
              max={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <div className="flex gap-2 justify-between">
            <button className="btn-ghost" onClick={() => setStep(1)}>Back</button>
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={handleFinish}>Skip</button>
              <button className="btn-primary" onClick={handleFinish}>Start Healing</button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
