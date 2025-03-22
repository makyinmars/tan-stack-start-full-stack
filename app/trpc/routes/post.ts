import { z } from "zod";
import { publicProcedure } from "../init";
import { TRPCError, TRPCRouterRecord } from "@trpc/server";


type Post = {
  id: string;
  title: string;
  body: string;
};

export const postRouter = {
  list: publicProcedure.query(async () => {
    const posts = await fetch(
      'https://jsonplaceholder.typicode.com/posts',
    ).then((r) => r.json() as Promise<Array<Post>>);
    return posts.slice(0, 10);
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const post = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${input.id}`,
      ).then((r) => {
        if (r.status === 404) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        return r.json() as Promise<Post>;
      });

      return post;
    }),

  create: publicProcedure
    .input(z.object({ title: z.string(), body: z.string() }))
    .mutation(async ({ input }) => {
      const post = {
        id: Math.random().toString(36).slice(2),
        title: input.title,
        body: input.body,
      } as Post;

      return post

    }),
} satisfies TRPCRouterRecord;
