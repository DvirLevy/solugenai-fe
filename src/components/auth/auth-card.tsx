import { type ReactNode } from 'react'
import { GradientBorder } from '@/components/common/gradient-border'

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <GradientBorder innerClassName="px-6 py-8 sm:px-10 sm:py-10">
      {children}
    </GradientBorder>
  )
}
