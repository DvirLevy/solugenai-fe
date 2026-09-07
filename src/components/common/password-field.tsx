import { forwardRef, useState, type ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type PasswordFieldProps = Omit<ComponentProps<typeof Input>, 'type'> & {
  id: string
  label: string
  error?: string
  helperText?: string
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(
    { id, label, error, helperText, className, ...props },
    ref,
  ) {
    const [visible, setVisible] = useState(false)
    const errorId = `${id}-error`
    const helperId = `${id}-helper`

    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          <Input
            id={id}
            ref={ref}
            type={visible ? 'text' : 'password'}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn('pr-16', className)}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-3 flex items-center text-sm font-medium"
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>
        {error ? (
          <p id={errorId} className="text-destructive text-sm">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-muted-foreground text-sm">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  },
)
