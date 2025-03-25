import { signInSchema, signUpSchema } from "@/validators/auth";
import { protectedProcedure, publicProcedure } from "../init";
import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { registerUserUseCase, signInUseCase } from "@/services/auth";
import { setSession } from "@/lib/session";
import { rateLimitByKey } from "@/lib/limiter";

export const authRouter = {
  signIn: publicProcedure.input(signInSchema).mutation(async ({ input }) => {
    const validResult = signInSchema.safeParse(input);
    if (!validResult.success) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: validResult.error.message,
      });
    }

    const { email, password } = validResult.data;

    await rateLimitByKey({ key: email, limit: 3, window: 10000 });

    const user = await signInUseCase(email, password);
    await setSession(user.id);
  }),
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    const validResult = signUpSchema.safeParse(input);
    if (!validResult.success) {
      for (const error of validResult.error.issues) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }

    const { email, password } = input;

    const user = await registerUserUseCase(email, password);
    await setSession(user.id as string);
  }),

  session: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
} satisfies TRPCRouterRecord;
