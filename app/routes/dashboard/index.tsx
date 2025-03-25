import AuthContentLayout from "@/components/common/auth-content-layout";
import PageHeader from "@/components/common/page-header";
import { assertAuthenticatedFn } from "@/fn/auth";
import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
  beforeLoad: () => assertAuthenticatedFn(),

  loader: async ({ context }) => {
    const posts = await context.queryClient.ensureQueryData(
      context.trpc.post.authList.queryOptions()
    );
    return { posts };
  },
});

function RouteComponent() {
  const trpc = useTRPC();

  const postQuery = useSuspenseQuery(trpc.post.authList.queryOptions());
  console.log("postQuery data", postQuery.data);
  return (
    <AuthContentLayout>
      <PageHeader title="Dashboard" description="Welcome to your dashboard" />
    </AuthContentLayout>
  );
}
