type ClassValue = string | number | boolean | undefined | null | ClassValue[] | Record<string, unknown>

// Lightweight cn() — no external dependency
export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flatMap((i) => {
      if (!i) return []
      if (typeof i === 'string') return [i]
      if (typeof i === 'number') return [String(i)]
      if (Array.isArray(i)) return [cn(...i)]
      if (typeof i === 'object') {
        return Object.entries(i as Record<string, unknown>)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k)
      }
      return []
    })
    .join(' ')
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatRelative(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDateShort(iso)
}

export function formatDuration(startIso: string): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
} {
  const diff = Date.now() - new Date(startIso).getTime()
  const total = Math.max(0, diff)
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / (1000 * 60)) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  return { days, hours, minutes, seconds, total }
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function groupByDate<T extends { createdAt: string }>(items: T[]): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = item.createdAt.split('T')[0]
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

// Capitalize first letter
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
