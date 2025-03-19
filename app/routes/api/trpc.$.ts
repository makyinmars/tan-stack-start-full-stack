import { createAPIFileRoute } from '@tanstack/react-start/api';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { db } from '~/db';
import { trpcRouter } from '~/trpc/router';

function handler({ request }: { request: Request }) {
  return fetchRequestHandler({
    req: request,
    router: trpcRouter,
    endpoint: '/api/trpc',
    createContext() {
      return {
        db,
        headers: request.headers,
      };
    }
  });
}

export const APIRoute = createAPIFileRoute('/api/trpc/$')({
  GET: handler,
  POST: handler,
});
