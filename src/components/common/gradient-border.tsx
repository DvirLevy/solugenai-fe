import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function GradientBorder({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode
  className?: string
  innerClassName?: string
}) {
  return (
    <div className={cn('bg-brand-border-gradient rounded-shell p-[3px]', className)}>
      <div
        className={cn('bg-surface h-full w-full', innerClassName)}
        style={{ borderRadius: 'calc(var(--radius-shell) - 3px)' }}
      >
        {children}
      </div>
    </div>
  )
}
