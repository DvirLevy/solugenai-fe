import { cva, type VariantProps } from 'class-variance-authority'
import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const alertVariants = cva('rounded-control border p-4 text-sm [&_svg]:size-4', {
  variants: {
    variant: {
      default: 'bg-surface border-border text-foreground',
      destructive:
        'bg-destructive-surface border-destructive-border text-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type AlertProps = ComponentProps<'div'> & VariantProps<typeof alertVariants>

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant, className }))}
      {...props}
    />
  )
}

export function AlertDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('leading-relaxed', className)}
      {...props}
    />
  )
}
