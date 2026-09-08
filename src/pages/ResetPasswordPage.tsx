import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthCard } from '@/components/auth/auth-card'
import { FormError } from '@/components/common/form-error'
import { LoadingButton } from '@/components/common/loading-button'
import { Logo } from '@/components/common/logo'
import { PageHeader } from '@/components/common/page-header'
import { PasswordField } from '@/components/common/password-field'
import { AuthLayout } from '@/layouts/auth-layout'
import { ApiError } from '@/lib/api-client'
import { getErrorMessage } from '@/lib/get-error-message'
import { useResetPassword } from '@/queries/auth.queries'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/schemas/auth.schema'

const FIELD_NAMES = ['tempPassword', 'newPassword', 'confirmNewPassword'] as const

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')
  const resetPasswordMutation = useResetPassword()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { tempPassword: '', newPassword: '', confirmNewPassword: '' },
  })

  const onSubmit = handleSubmit((values) => {
    if (!email) return

    setFormError(null)
    resetPasswordMutation.mutate(
      { email, tempPassword: values.tempPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          navigate('/login', { replace: true, state: { passwordReset: true } })
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors) {
            let mapped = false
            for (const [field, message] of Object.entries(error.fieldErrors)) {
              if ((FIELD_NAMES as readonly string[]).includes(field)) {
                setError(field as (typeof FIELD_NAMES)[number], { message })
                mapped = true
              }
            }
            if (!mapped) setFormError(error.message)
          } else {
            setFormError(getErrorMessage(error))
          }
        },
      },
    )
  })

  return (
    <AuthLayout>
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <AuthCard>
        <PageHeader
          title="Set a new password"
          subtitle="Enter the temporary password from your email and choose a new one"
        />
        {email ? (
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <PasswordField
              id="tempPassword"
              label="Temporary password"
              placeholder="Enter the password from your email"
              error={errors.tempPassword?.message}
              {...register('tempPassword')}
            />
            <PasswordField
              id="newPassword"
              label="New password"
              placeholder="Enter new password"
              error={errors.newPassword?.message}
              helperText="At least 8 characters, one number and one symbol"
              {...register('newPassword')}
            />
            <PasswordField
              id="confirmNewPassword"
              label="Confirm new password"
              placeholder="Re-enter new password"
              error={errors.confirmNewPassword?.message}
              {...register('confirmNewPassword')}
            />
            <FormError message={formError} />
            <LoadingButton type="submit" isLoading={resetPasswordMutation.isPending}>
              Set new password
            </LoadingButton>
          </form>
        ) : (
          <FormError message="This link is invalid or has expired. Please use the link from your email." />
        )}
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Remembered your password?{' '}
          <Link to="/login" className="text-brand font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}
