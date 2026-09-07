import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input-border bg-surface text-foreground placeholder:text-placeholder h-control flex w-full rounded-control border px-4 text-sm transition-colors',
        'focus-visible:border-ring focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
        'aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}
