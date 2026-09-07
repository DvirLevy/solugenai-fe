import { Button } from '@/components/ui/button'
import { Logo } from '@/components/common/logo'
import { UserBadge } from '@/components/common/user-badge'

export function AppNavbar({
  fullName,
  email,
  onLogout,
  isLoggingOut = false,
}: {
  fullName?: string | null
  email: string
  onLogout: () => void
  isLoggingOut?: boolean
}) {
  return (
    <header className="bg-surface border-border shadow-bar border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo align="start" className="scale-90 sm:scale-100" />
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <UserBadge fullName={fullName} email={email} />
          <Button
            type="button"
            variant="dark"
            size="sm"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out…' : 'Log out'}
          </Button>
        </div>
      </div>
    </header>
  )
}
