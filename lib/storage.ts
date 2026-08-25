// localStorage utility — safe for SSR (checks typeof window)

export function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota exceeded or private mode — silently fail
  }
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(key)
}

// ─── Storage keys ─────────────────────────────────────────────────────────────
export const KEYS = {
  USER_CONFIG: 'unsent_user_config',
  DIARY: 'unsent_diary',
  URGE: 'unsent_urge',
  UNSENT_MESSAGES: 'unsent_messages',
  MEMORIES: 'unsent_memories',
  CURIOSITY: 'unsent_curiosity',
  REFLECTIONS: 'unsent_reflections',
  FUTURE_ME: 'unsent_future_me',
} as const
