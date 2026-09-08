import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { AppNavbar } from '@/components/common/app-navbar'
import { GradientBorder } from '@/components/common/gradient-border'
import { authKeys, useLogout } from '@/queries/auth.queries'
import type { User } from '@/types/auth'

export function DashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = queryClient.getQueryData<User | null>(authKeys.currentUser)
  const logout = useLogout()

  const firstName = user?.fullName?.trim().split(/\s+/)[0]

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/login', { replace: true }),
    })
  }

  return (
    <div className="bg-background min-h-screen">
      <AppNavbar
        fullName={user?.fullName}
        email={user?.email ?? ''}
        onLogout={handleLogout}
        isLoggingOut={logout.isPending}
      />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <GradientBorder className="max-w-2xl">
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
              Welcome back{firstName ? `, ${firstName}` : ''} 👋
            </h1>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base">
              This page is only reachable with a valid, authenticated session.
            </p>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted-foreground font-medium">Name:</dt>
                <dd className="text-foreground">{user?.fullName}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground font-medium">Email:</dt>
                <dd className="text-foreground">{user?.email}</dd>
              </div>
            </dl>
          </div>
        </GradientBorder>
      </main>
    </div>
  )
}
