'use client'

import { useState, useEffect } from 'react'
import { formatDuration } from '@/lib/utils'
import type { NoContactConfig } from '@/types'

export function useNoContactTimer(config: NoContactConfig | null) {
  const [duration, setDuration] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })

  useEffect(() => {
    if (!config?.startDate) return
    const tick = () => setDuration(formatDuration(config.startDate))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [config?.startDate])

  return duration
}
