import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { db } from "@/db";
import { trpcRouter } from "@/trpc/router";
import { validateRequest } from "@/lib/auth";
import { createAPIFileRoute } from "@tanstack/react-start/api";

// Adapter function for TanStack
const handler = ({ request }: { request: Request }) => {
  // Create a simple response using the same TRPC handler logic
  return fetchRequestHandler({
    req: request,
    router: trpcRouter,
    endpoint: "/api/trpc",
    createContext: async () => {
      return {
        db,
        session: await validateRequest()
      };
    },
  });
};

export const APIRoute = createAPIFileRoute("/api/trpc/$")({
  GET: handler,
  POST: handler,
});
