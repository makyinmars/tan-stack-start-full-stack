import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  return <div>Login</div>;
}
