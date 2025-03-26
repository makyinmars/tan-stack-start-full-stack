import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../init";
import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const postRouter = {
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(posts).orderBy(posts.createdAt);
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const post = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id));

      if (post.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return post[0];
    }),

  create: protectedProcedure
    .input(z.object({ title: z.string(), body: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const post = {
        id: Math.random().toString(36).slice(2),
        title: input.title,
        body: input.body,
      };

      const newPosts = await ctx.db
        .insert(posts)
        .values({
          id: post.id,
          title: post.title,
          body: post.body,
        })
        .returning();

      return newPosts[0];
    }),
  authList: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(posts);
  }),
} satisfies TRPCRouterRecord;
