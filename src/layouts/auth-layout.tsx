import { type ReactNode } from 'react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-card w-full">{children}</div>
    </main>
  )
}
