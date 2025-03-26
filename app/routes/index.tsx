import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {

  return (
    <div className="p-2 flex flex-col gap-4">
      <h3>Welcome Home!!!</h3>
    </div>
  );
}
