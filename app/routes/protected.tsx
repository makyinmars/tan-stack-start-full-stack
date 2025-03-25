import { assertAuthenticatedFn } from '@/fn/auth'
import { useTRPC } from '@/trpc/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/protected')({
  component: RouteComponent,
  beforeLoad: () => assertAuthenticatedFn(),
  // This Will only run if the user is authenticated
  // We won't get an error if the user is not authenticated
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.auth.session.queryOptions()
    )
  },
})

function RouteComponent() {

  const trpc = useTRPC();

  const sessionQuery = useSuspenseQuery(trpc.auth.session.queryOptions());

  return <div>Hello protected!, session: {JSON.stringify(sessionQuery.data)}</div>
}
