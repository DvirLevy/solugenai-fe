import { Loader2 } from 'lucide-react'

export function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="bg-background flex min-h-screen items-center justify-center"
    >
      <Loader2 className="text-brand size-8 animate-spin" aria-hidden />
    </div>
  )
}
