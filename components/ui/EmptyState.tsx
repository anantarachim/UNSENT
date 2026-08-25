import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-surface-hover border border-surface-border flex items-center justify-center text-slate-600 mb-4">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
      {description && <p className="text-xs text-slate-600 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
