'use client'

import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'How are you holding up today?' },
  '/diary': { title: 'Diary', subtitle: 'Write what you cannot say out loud' },
  '/no-contact': { title: 'No Contact', subtitle: 'Every day of silence is a choice for yourself' },
  '/urge-tracker': { title: 'Urge Tracker', subtitle: 'Acknowledge the urge — then let it pass' },
  '/unsent': { title: 'Unsent Messages', subtitle: 'Say what you need to say, without sending it' },
  '/curiosity': { title: 'I Want To Know', subtitle: 'Curiosity is not weakness — holding it is strength' },
  '/memories': { title: 'Memories', subtitle: 'A timeline of what was real' },
  '/reflection': { title: 'Reflection', subtitle: 'Turn the questions inward' },
  '/future-me': { title: 'Future Me', subtitle: 'Who you are becoming matters more' },
  '/statistics': { title: 'Progress', subtitle: 'You have come further than you think' },
}

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname()
  const meta = PAGE_TITLES[pathname] ?? { title: 'UNSENT', subtitle: '' }

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-surface-border bg-navy-900/60 backdrop-blur-sm sticky top-0 z-30">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden btn-ghost p-1.5 -ml-1.5"
          aria-label="Open menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div>
          <h1 className="text-sm font-semibold text-slate-200 leading-tight">{meta.title}</h1>
          {meta.subtitle && (
            <p className="text-[11px] text-slate-600 leading-tight hidden sm:block">{meta.subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: date */}
      <div className="text-xs text-slate-600 tabular-nums hidden sm:block">
        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </header>
  )
}
