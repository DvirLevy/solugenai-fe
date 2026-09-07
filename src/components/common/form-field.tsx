import { forwardRef, type ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormFieldProps = ComponentProps<typeof Input> & {
  id: string
  label: string
  error?: string
  helperText?: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField({ id, label, error, helperText, className, ...props }, ref) {
    const errorId = `${id}-error`
    const helperId = `${id}-helper`

    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={className}
          {...props}
        />
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
