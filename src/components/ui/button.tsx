import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-sm font-semibold transition-[filter,background-color] disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        brand:
          'bg-brand-gradient text-brand-foreground shadow-card hover:brightness-105 active:brightness-95',
        dark: 'bg-ink text-ink-foreground hover:bg-ink/90',
        outline:
          'border border-border bg-surface text-foreground hover:bg-background',
        ghost: 'text-brand hover:underline underline-offset-2',
      },
      size: {
        default: 'h-11 px-4',
        lg: 'h-action px-6 text-base',
        sm: 'h-10 px-4',
      },
    },
    defaultVariants: {
      variant: 'brand',
      size: 'default',
    },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
