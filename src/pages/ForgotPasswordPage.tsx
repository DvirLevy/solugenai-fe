import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { AuthCard } from '@/components/auth/auth-card'
import { FormError } from '@/components/common/form-error'
import { FormField } from '@/components/common/form-field'
import { LoadingButton } from '@/components/common/loading-button'
import { Logo } from '@/components/common/logo'
import { PageHeader } from '@/components/common/page-header'
import { AuthLayout } from '@/layouts/auth-layout'
import { getErrorMessage } from '@/lib/get-error-message'
import { useForgotPassword } from '@/queries/auth.queries'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/schemas/auth.schema'

export function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword()
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit((values) => {
    setFormError(null)
    forgotPasswordMutation.mutate(values, {
      // Show the same confirmation whether or not the email is registered —
      // the backend is expected to respond identically either way so this
      // page can't be used to enumerate accounts.
      onSuccess: () => setSubmittedEmail(values.email),
      onError: (error) => setFormError(getErrorMessage(error)),
    })
  })

  return (
    <AuthLayout>
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <AuthCard>
        {submittedEmail ? (
          <>
            <PageHeader
              title="Check your email"
              subtitle={`If an account exists for ${submittedEmail}, we've sent a temporary password to it.`}
            />
            <p className="text-muted-foreground text-center text-sm">
              Follow the link in that email to set a new password.
            </p>
          </>
        ) : (
          <>
            <PageHeader
              title="Forgot your password?"
              subtitle="Enter your email and we'll send you a temporary password"
            />
            <form className="space-y-4" onSubmit={onSubmit} noValidate>
              <FormField
                id="email"
                label="Email"
                type="email"
                placeholder="Enter email"
                error={errors.email?.message}
                {...register('email')}
              />
              <FormError message={formError} />
              <LoadingButton type="submit" isLoading={forgotPasswordMutation.isPending}>
                Send temporary password
              </LoadingButton>
            </form>
          </>
        )}
        <p className="text-muted-foreground mt-6 text-center text-sm">
          {submittedEmail ? (
            <Link to="/login" className="text-brand font-semibold hover:underline">
              Back to sign in
            </Link>
          ) : (
            <>
              Remembered your password?{' '}
              <Link to="/login" className="text-brand font-semibold hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </AuthCard>
    </AuthLayout>
  )
}
