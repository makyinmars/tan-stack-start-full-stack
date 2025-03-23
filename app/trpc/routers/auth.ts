import { signInSchema } from "@/validators/auth";
import { publicProcedure } from "../init";
import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { rateLimitByIp } from "@/lib/limiter";
import { signInUseCase } from "@/services/auth";
import { setSession } from "@/lib/session";

export const authRouter = {
  signIn: publicProcedure.input(signInSchema).mutation(async ({ input }) => {
    try {
      const validResult = signInSchema.safeParse(input);
      if (!validResult.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: validResult.error.message,
        });
      }

      await rateLimitByIp({
        key: validResult.data.email, limit: 3, window: 10000,
      })

      const user = await signInUseCase(validResult.data.email, validResult.data.password);
      await setSession(user.id);
    } catch (e) {
      if (e instanceof TRPCError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: e.message,
        });
      }
    }
  })
} satisfies TRPCRouterRecord;
