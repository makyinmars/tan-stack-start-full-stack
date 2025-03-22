import { createAPIFileRoute } from '@tanstack/react-start/api'
import { deleteSessionTokenCookie } from "@/lib/session";
import { invalidateSession, validateRequest } from '@/lib/auth';

export const APIRoute = createAPIFileRoute("/api/logout")({
  GET: async () => {
    const { session } = await validateRequest();
    if (!session) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }
    await invalidateSession(session?.id);
    await deleteSessionTokenCookie();
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  },
});
