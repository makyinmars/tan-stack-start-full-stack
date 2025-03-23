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
    const posts = await context.queryClient.ensureQueryData(
      context.trpc.post.authList.queryOptions()
    );
    return { posts };
  },
})

function RouteComponent() {

  const trpc = useTRPC();

  const postQuery = useSuspenseQuery(trpc.post.authList.queryOptions());

  console.log("postQuery data", postQuery);
  return <div>Hello protected!</div>
}
