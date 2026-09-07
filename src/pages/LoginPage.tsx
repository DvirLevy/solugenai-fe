import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard } from '@/components/auth/auth-card'
import { FormError } from '@/components/common/form-error'
import { FormField } from '@/components/common/form-field'
import { LoadingButton } from '@/components/common/loading-button'
import { Logo } from '@/components/common/logo'
import { PageHeader } from '@/components/common/page-header'
import { PasswordField } from '@/components/common/password-field'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/layouts/auth-layout'
import { getErrorMessage } from '@/lib/get-error-message'
import { useLogin } from '@/queries/auth.queries'
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const rememberMe = watch('rememberMe')

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => navigate('/dashboard', { replace: true }),
    })
  })

  return (
    <AuthLayout>
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <AuthCard>
        <PageHeader
          title="Welcome back"
          subtitle="Enter your email and password to sign in"
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
          <PasswordField
            id="password"
            label="Password"
            placeholder="Enter password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue('rememberMe', checked === true)}
              />
              <Label htmlFor="rememberMe" className="font-normal">
                Remember me
              </Label>
            </div>
            {/* Not implemented in this assignment — kept for visual fidelity with the mockup. */}
            <span
              aria-disabled="true"
              className="text-brand text-sm font-semibold opacity-70"
            >
              Forgot your password?
            </span>
          </div>
          <FormError message={login.isError ? getErrorMessage(login.error) : null} />
          <LoadingButton type="submit" isLoading={login.isPending}>
            Sign In
          </LoadingButton>
        </form>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}
