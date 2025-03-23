import { createTRPCRouter } from "./init";
import { authRouter } from "./routers/auth";
import { postRouter } from "./routers/post";
import { userRouter } from "./routers/user";

export const trpcRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  auth: authRouter
});
export type TRPCRouter = typeof trpcRouter;
