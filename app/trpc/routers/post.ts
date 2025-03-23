import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../init";
import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { posts } from "@/db/schema";


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
    .mutation(async ({ input, ctx }) => {

      const post = {
        id: Math.random().toString(36).slice(2),
        title: input.title,
        body: input.body,
      } as Post;

      const newPosts = await ctx.db.insert(posts).values({
        id: post.id,
        title: post.title,
        body: post.body,
      }).returning()

      console.log("New Posts", newPosts);

      return newPosts[0];
    }),
  dbList: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(posts);
  }),
  authList: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(posts);
  }),
} satisfies TRPCRouterRecord;
