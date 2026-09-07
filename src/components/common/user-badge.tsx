import { getInitials } from '@/lib/utils'

export function UserBadge({
  fullName,
  email,
}: {
  fullName?: string | null
  email: string
}) {
  const initials = getInitials(fullName)

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        aria-hidden
        className="bg-brand text-brand-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      >
        {initials}
      </span>
      <span className="text-foreground hidden truncate text-sm sm:inline">
        {email}
      </span>
    </div>
  )
}
