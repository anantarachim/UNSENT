'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useToast, type Toast } from '@/hooks/useToast'
import { KEYS } from '@/lib/storage'
import { generateId } from '@/lib/utils'
import type {
  UserConfig,
  DiaryEntry,
  UrgeEntry,
  UnsentMessage,
  Memory,
  CuriosityEntry,
  ReflectionEntry,
  FutureMeEntry,
} from '@/types'

// ─── Context shape ────────────────────────────────────────────────────────────
interface AppContextValue {
  // User
  user: UserConfig
  setUser: (v: UserConfig | ((p: UserConfig) => UserConfig)) => void

  // Diary
  diaryEntries: DiaryEntry[]
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateDiaryEntry: (id: string, patch: Partial<DiaryEntry>) => void
  deleteDiaryEntry: (id: string) => void

  // Urge
  urgeEntries: UrgeEntry[]
  addUrge: (entry: Omit<UrgeEntry, 'id' | 'createdAt'>) => void
  deleteUrge: (id: string) => void

  // Unsent Messages
  unsentMessages: UnsentMessage[]
  addUnsentMessage: (msg: Omit<UnsentMessage, 'id' | 'createdAt'>) => void
  deleteUnsentMessage: (id: string) => void

  // Memories
  memories: Memory[]
  addMemory: (m: Omit<Memory, 'id' | 'createdAt'>) => void
  updateMemory: (id: string, patch: Partial<Memory>) => void
  deleteMemory: (id: string) => void

  // Curiosity
  curiosityEntries: CuriosityEntry[]
  addCuriosity: (e: Omit<CuriosityEntry, 'id' | 'createdAt'>) => void
  updateCuriosity: (id: string, patch: Partial<CuriosityEntry>) => void
  deleteCuriosity: (id: string) => void

  // Reflections
  reflections: ReflectionEntry[]
  saveReflection: (promptId: string, answer: string) => void

  // Future Me
  futureMeEntries: FutureMeEntry[]
  addFutureMe: (e: Omit<FutureMeEntry, 'id' | 'createdAt'>) => void
  toggleFutureMe: (id: string) => void
  deleteFutureMe: (id: string) => void

  // Toast
  toasts: Toast[]
  toast: (msg: string, type?: Toast['type']) => void
  removeToast: (id: string) => void

  // Hydration
  hydrated: boolean
}

const defaultUser: UserConfig = {
  name: '',
  setupComplete: false,
  noContact: null,
  theme: 'dark',
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser, userHydrated] = useLocalStorage<UserConfig>(KEYS.USER_CONFIG, defaultUser)
  const [diaryEntries, setDiary, diaryHydrated] = useLocalStorage<DiaryEntry[]>(KEYS.DIARY, [])
  const [urgeEntries, setUrge, urgeHydrated] = useLocalStorage<UrgeEntry[]>(KEYS.URGE, [])
  const [unsentMessages, setUnsent, unsentHydrated] = useLocalStorage<UnsentMessage[]>(KEYS.UNSENT_MESSAGES, [])
  const [memories, setMemories, memoriesHydrated] = useLocalStorage<Memory[]>(KEYS.MEMORIES, [])
  const [curiosityEntries, setCuriosity, curiosityHydrated] = useLocalStorage<CuriosityEntry[]>(KEYS.CURIOSITY, [])
  const [reflections, setReflections, reflectionsHydrated] = useLocalStorage<ReflectionEntry[]>(KEYS.REFLECTIONS, [])
  const [futureMeEntries, setFutureMe, futureHydrated] = useLocalStorage<FutureMeEntry[]>(KEYS.FUTURE_ME, [])

  const { toasts, addToast, removeToast } = useToast()

  const hydrated =
    userHydrated && diaryHydrated && urgeHydrated && unsentHydrated &&
    memoriesHydrated && curiosityHydrated && reflectionsHydrated && futureHydrated

  // ─── Diary ─────────────────────────────────────────────────────────────────
  const addDiaryEntry = (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    setDiary((prev) => [{ ...entry, id: generateId(), createdAt: now, updatedAt: now }, ...prev])
  }
  const updateDiaryEntry = (id: string, patch: Partial<DiaryEntry>) => {
    setDiary((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e))
    )
  }
  const deleteDiaryEntry = (id: string) => setDiary((prev) => prev.filter((e) => e.id !== id))

  // ─── Urge ──────────────────────────────────────────────────────────────────
  const addUrge = (entry: Omit<UrgeEntry, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString()
    setUrge((prev) => [{ ...entry, id: generateId(), createdAt: now }, ...prev])
  }
  const deleteUrge = (id: string) => setUrge((prev) => prev.filter((e) => e.id !== id))

  // ─── Unsent Messages ───────────────────────────────────────────────────────
  const addUnsentMessage = (msg: Omit<UnsentMessage, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString()
    setUnsent((prev) => [{ ...msg, id: generateId(), createdAt: now }, ...prev])
  }
  const deleteUnsentMessage = (id: string) => setUnsent((prev) => prev.filter((m) => m.id !== id))

  // ─── Memories ──────────────────────────────────────────────────────────────
  const addMemory = (m: Omit<Memory, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString()
    setMemories((prev) => [...prev, { ...m, id: generateId(), createdAt: now }].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ))
  }
  const updateMemory = (id: string, patch: Partial<Memory>) => {
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }
  const deleteMemory = (id: string) => setMemories((prev) => prev.filter((m) => m.id !== id))

  // ─── Curiosity ─────────────────────────────────────────────────────────────
  const addCuriosity = (e: Omit<CuriosityEntry, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString()
    setCuriosity((prev) => [{ ...e, id: generateId(), createdAt: now }, ...prev])
  }
  const updateCuriosity = (id: string, patch: Partial<CuriosityEntry>) => {
    setCuriosity((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }
  const deleteCuriosity = (id: string) => setCuriosity((prev) => prev.filter((e) => e.id !== id))

  // ─── Reflections ───────────────────────────────────────────────────────────
  const saveReflection = (promptId: string, answer: string) => {
    const now = new Date().toISOString()
    setReflections((prev) => {
      const existing = prev.find((r) => r.promptId === promptId)
      if (existing) {
        return prev.map((r) => r.promptId === promptId ? { ...r, answer, updatedAt: now } : r)
      }
      return [...prev, { id: generateId(), promptId, answer, createdAt: now, updatedAt: now }]
    })
  }

  // ─── Future Me ─────────────────────────────────────────────────────────────
  const addFutureMe = (e: Omit<FutureMeEntry, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString()
    setFutureMe((prev) => [...prev, { ...e, id: generateId(), createdAt: now }])
  }
  const toggleFutureMe = (id: string) => {
    setFutureMe((prev) => prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)))
  }
  const deleteFutureMe = (id: string) => setFutureMe((prev) => prev.filter((e) => e.id !== id))

  const value: AppContextValue = {
    user, setUser,
    diaryEntries, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry,
    urgeEntries, addUrge, deleteUrge,
    unsentMessages, addUnsentMessage, deleteUnsentMessage,
    memories, addMemory, updateMemory, deleteMemory,
    curiosityEntries, addCuriosity, updateCuriosity, deleteCuriosity,
    reflections, saveReflection,
    futureMeEntries, addFutureMe, toggleFutureMe, deleteFutureMe,
    toasts, toast: addToast, removeToast,
    hydrated,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
