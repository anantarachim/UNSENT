// ─── Diary ───────────────────────────────────────────────────────────────────
export interface DiaryEntry {
  id: string
  date: string        // ISO string
  mood: MoodLevel
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Neutral',
  4: 'Good',
  5: 'Great',
}

export const MOOD_COLORS: Record<MoodLevel, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#22c55e',
  5: '#3b82f6',
}

// ─── Urge Tracker ────────────────────────────────────────────────────────────
export interface UrgeEntry {
  id: string
  date: string        // ISO date string "YYYY-MM-DD"
  type: UrgeType
  note?: string
  createdAt: string
}

export type UrgeType = 'stalk' | 'text' | 'call' | 'check_story' | 'other'

export const URGE_TYPE_LABELS: Record<UrgeType, string> = {
  stalk: 'Stalk Profile',
  text: 'Send Message',
  call: 'Call',
  check_story: 'Check Story',
  other: 'Other',
}

// ─── No Contact ──────────────────────────────────────────────────────────────
export interface NoContactConfig {
  startDate: string   // ISO string
  name: string        // name alias, never real name required
}

// ─── Unsent Messages ─────────────────────────────────────────────────────────
export interface UnsentMessage {
  id: string
  subject?: string
  content: string
  emotion: MessageEmotion
  createdAt: string
}

export type MessageEmotion = 'anger' | 'grief' | 'longing' | 'gratitude' | 'acceptance' | 'confusion'

export const MESSAGE_EMOTION_LABELS: Record<MessageEmotion, string> = {
  anger: 'Anger',
  grief: 'Grief',
  longing: 'Longing',
  gratitude: 'Gratitude',
  acceptance: 'Acceptance',
  confusion: 'Confusion',
}

export const MESSAGE_EMOTION_COLORS: Record<MessageEmotion, string> = {
  anger: '#ef4444',
  grief: '#8b5cf6',
  longing: '#ec4899',
  gratitude: '#22c55e',
  acceptance: '#3b82f6',
  confusion: '#f59e0b',
}

// ─── Memories ────────────────────────────────────────────────────────────────
export interface Memory {
  id: string
  date: string        // ISO date string
  title: string
  description: string
  category: MemoryCategory
  createdAt: string
}

export type MemoryCategory = 'first_time' | 'special_day' | 'everyday' | 'conflict' | 'milestone' | 'last_time'

export const MEMORY_CATEGORY_LABELS: Record<MemoryCategory, string> = {
  first_time: 'First Time',
  special_day: 'Special Day',
  everyday: 'Everyday Moment',
  conflict: 'Conflict',
  milestone: 'Milestone',
  last_time: 'Last Time',
}

// ─── I Want To Know ──────────────────────────────────────────────────────────
export interface CuriosityEntry {
  id: string
  question: string
  intensity: 1 | 2 | 3   // 1=mild, 2=strong, 3=overwhelming
  resolved: boolean
  note?: string
  createdAt: string
}

// ─── Reflection ──────────────────────────────────────────────────────────────
export interface ReflectionEntry {
  id: string
  promptId: string
  answer: string
  createdAt: string
  updatedAt: string
}

export interface ReflectionPrompt {
  id: string
  question: string
  category: 'identity' | 'grief' | 'growth' | 'clarity'
}

export const REFLECTION_PROMPTS: ReflectionPrompt[] = [
  { id: 'rp1', question: 'Do I miss her, or do I miss being loved?', category: 'clarity' },
  { id: 'rp2', question: 'What did I learn about myself in this relationship?', category: 'identity' },
  { id: 'rp3', question: 'What part of me grew because of this?', category: 'growth' },
  { id: 'rp4', question: 'What would I tell my past self before entering this relationship?', category: 'identity' },
  { id: 'rp5', question: 'What did I compromise that I shouldn\'t have?', category: 'clarity' },
  { id: 'rp6', question: 'What does grief feel like for me right now, in one sentence?', category: 'grief' },
  { id: 'rp7', question: 'Am I avoiding healing by staying busy?', category: 'growth' },
  { id: 'rp8', question: 'What does the version of me 12 months from now look like?', category: 'growth' },
  { id: 'rp9', question: 'What patterns do I want to break before the next relationship?', category: 'identity' },
  { id: 'rp10', question: 'If I never spoke to her again, what would remain unresolved in me?', category: 'grief' },
]

// ─── Future Me ───────────────────────────────────────────────────────────────
export interface FutureMeEntry {
  id: string
  horizon: '3m' | '6m' | '12m'
  category: FutureCategory
  goal: string
  completed: boolean
  createdAt: string
}

export type FutureCategory = 'health' | 'career' | 'social' | 'personal' | 'travel' | 'skill'

export const FUTURE_CATEGORY_LABELS: Record<FutureCategory, string> = {
  health: 'Health',
  career: 'Career',
  social: 'Social',
  personal: 'Personal Growth',
  travel: 'Travel',
  skill: 'Skill',
}

export const HORIZON_LABELS: Record<string, string> = {
  '3m': '3 Months',
  '6m': '6 Months',
  '12m': '12 Months',
}

// ─── User Config ─────────────────────────────────────────────────────────────
export interface UserConfig {
  name: string
  setupComplete: boolean
  noContact: NoContactConfig | null
  theme: 'dark'
}
