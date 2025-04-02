import AuthContentLayout from '@/components/common/auth-content-layout'
import { assertAuthenticatedFn } from '@/fn/auth'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => assertAuthenticatedFn(),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthContentLayout>
      <Outlet />
    </AuthContentLayout>)
}
