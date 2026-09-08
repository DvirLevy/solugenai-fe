import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard } from '@/components/auth/auth-card'
import { FormError } from '@/components/common/form-error'
import { FormField } from '@/components/common/form-field'
import { LoadingButton } from '@/components/common/loading-button'
import { Logo } from '@/components/common/logo'
import { PageHeader } from '@/components/common/page-header'
import { PasswordField } from '@/components/common/password-field'
import { AuthLayout } from '@/layouts/auth-layout'
import { ApiError } from '@/lib/api-client'
import { getErrorMessage } from '@/lib/get-error-message'
import { authKeys, useRegister } from '@/queries/auth.queries'
import { registerSchema, type RegisterFormValues } from '@/schemas/auth.schema'
import type { User } from '@/types/auth'

const FIELD_NAMES = ['fullName', 'email', 'password', 'confirmPassword'] as const

export function RegisterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const registerMutation = useRegister()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit((values) => {
    setFormError(null)
    registerMutation.mutate(
      { fullName: values.fullName, email: values.email, password: values.password },
      {
        onSuccess: async () => {
          await queryClient.refetchQueries({ queryKey: authKeys.currentUser })
          const user = queryClient.getQueryData<User | null>(authKeys.currentUser)
          if (user) {
            navigate('/dashboard', { replace: true })
          } else {
            navigate('/login', { replace: true, state: { registered: true } })
          }
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
        <PageHeader title="Create your account" subtitle="Sign up to get started" />
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <FormField
            id="fullName"
            label="Full name"
            placeholder="Enter full name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="Enter email"
            error={errors.email?.message}
            {...register('email')}
          />
          <PasswordField
            id="password"
            label="Password"
            placeholder="Enter password"
            error={errors.password?.message}
            helperText="At least 8 characters, one number and one symbol"
            {...register('password')}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            placeholder="Re-enter password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <FormError message={formError} />
          <LoadingButton type="submit" isLoading={registerMutation.isPending}>
            Create account
          </LoadingButton>
        </form>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}
