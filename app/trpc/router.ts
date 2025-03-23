import { createTRPCRouter } from "./init";
import { postRouter } from "./routers/post";
import { userRouter } from "./routers/user";

export const trpcRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
});
export type TRPCRouter = typeof trpcRouter;
