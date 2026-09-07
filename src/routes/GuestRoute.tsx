import { Navigate, Outlet } from 'react-router-dom'
import { PageLoader } from '@/components/common/page-loader'
import { useCurrentUser } from '@/queries/auth.queries'

/**
 * Guards routes meant for signed-out visitors (login/register). An already
 * authenticated user is sent to the dashboard instead of seeing these forms.
 */
export function GuestRoute() {
  const { data: user, isPending } = useCurrentUser()

  if (isPending) {
    return <PageLoader />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
