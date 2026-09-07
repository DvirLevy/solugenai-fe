import { Navigate, Outlet } from 'react-router-dom'
import { PageLoader } from '@/components/common/page-loader'
import { useCurrentUser } from '@/queries/auth.queries'

/**
 * Guards routes that require an authenticated session. Never renders the
 * outlet before the auth check resolves, so protected content can't flash.
 */
export function ProtectedRoute() {
  const { data: user, isPending } = useCurrentUser()

  if (isPending) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
