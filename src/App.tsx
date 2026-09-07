/**
 * Temporary component gallery for Task 2 visual QA.
 * Replaced by the router and real pages in Task 4.
 */
import { useState } from 'react'
import { AppNavbar } from '@/components/common/app-navbar'
import { FormError } from '@/components/common/form-error'
import { FormField } from '@/components/common/form-field'
import { GradientBorder } from '@/components/common/gradient-border'
import { LoadingButton } from '@/components/common/loading-button'
import { Logo } from '@/components/common/logo'
import { PageHeader } from '@/components/common/page-header'
import { PasswordField } from '@/components/common/password-field'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-foreground text-lg font-bold">{title}</h2>
      <div className="flex flex-wrap items-start gap-6">{children}</div>
    </section>
  )
}

export default function App() {
  const [checked, setChecked] = useState(false)

  return (
    <div className="bg-background min-h-screen">
      <AppNavbar fullName="Jane Doe" email="jane.doe@example.com" onLogout={() => {}} />

      <main className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6">
        <Section title="Logo">
          <Logo />
        </Section>

        <Section title="Buttons">
          <LoadingButton className="max-w-xs">Sign In</LoadingButton>
          <LoadingButton className="max-w-xs" isLoading>
            Sign In
          </LoadingButton>
          <Button variant="dark" size="sm">
            Log out
          </Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Sign up</Button>
        </Section>

        <Section title="Checkbox">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
            />
            <Label htmlFor="remember">Remember me</Label>
          </div>
        </Section>

        <Section title="FormError">
          <FormError message="Invalid email or password." />
        </Section>

        <Section title="Login card (default + error states)">
          <GradientBorder className="w-full max-w-sm">
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <PageHeader
                title="Welcome back"
                subtitle="Enter your email and password to sign in"
              />
              <form className="space-y-4">
                <FormField id="email" label="Email" placeholder="Enter email" />
                <PasswordField
                  id="password"
                  label="Password"
                  placeholder="Enter password"
                />
                <LoadingButton type="button">Sign In</LoadingButton>
              </form>
            </div>
          </GradientBorder>

          <GradientBorder className="w-full max-w-sm">
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <PageHeader title="Welcome back" subtitle="Enter your email and password to sign in" />
              <form className="space-y-4">
                <FormField
                  id="email-err"
                  label="Email"
                  placeholder="Enter email"
                  error="Please enter a valid email address."
                />
                <PasswordField
                  id="password-err"
                  label="Password"
                  placeholder="Enter password"
                  error="Password is required."
                />
                <FormError message="Invalid email or password." />
                <LoadingButton type="button">Sign In</LoadingButton>
              </form>
            </div>
          </GradientBorder>
        </Section>

        <Section title="Password helper text">
          <div className="w-full max-w-sm">
            <PasswordField
              id="password-helper"
              label="Password"
              placeholder="Enter password"
              helperText="At least 8 characters, one number and one symbol"
            />
          </div>
        </Section>
      </main>
    </div>
  )
}
