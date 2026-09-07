import { cn } from '@/lib/utils'

/**
 * Recreated typographic wordmark — no logo asset was supplied with the
 * mockups. Swap for a real SVG if one becomes available.
 */
type LogoProps = {
  className?: string
  align?: 'center' | 'start'
}

export function Logo({ className, align = 'center' }: LogoProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        align === 'center' ? 'items-center' : 'items-start',
        className,
      )}
    >

      <span className="text-foreground text-xl font-extrabold tracking-tight">
        Solu
        <span className="from-brand-from to-brand-to bg-gradient-to-r bg-clip-text text-transparent">
          Gen
        </span>
        AI
      </span>
      <span className="text-muted-foreground -mt-0.5 text-xs italic">
        by comple
      </span>
    </div>
  )
}
