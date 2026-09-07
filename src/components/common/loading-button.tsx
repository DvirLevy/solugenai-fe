import { Loader2 } from 'lucide-react'
import { type ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type LoadingButtonProps = ComponentProps<typeof Button> & {
  isLoading?: boolean
}

export function LoadingButton({
  isLoading = false,
  disabled,
  className,
  children,
  variant = 'brand',
  size = 'lg',
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn('w-full', className)}
      disabled={isLoading || disabled}
      variant={variant}
      size={size}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </Button>
  )
}
