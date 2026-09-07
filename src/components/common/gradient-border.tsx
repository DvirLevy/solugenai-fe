import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The signature 3px teal→mint gradient frame from the mockups, wrapping a
 * white inner surface. The inner radius is shaved by the border thickness so
 * the frame nests cleanly instead of leaving visible corner gaps.
 */
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
