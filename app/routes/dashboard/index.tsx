import AuthContentLayout from "@/components/common/auth-content-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthContentLayout>
      <div>Hello "/dashboard/"!</div>
    </AuthContentLayout>
  );
}
