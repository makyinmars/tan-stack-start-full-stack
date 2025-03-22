import { createTRPCRouter } from './init';
import { postRouter } from './routes/post';
import { userRouter } from './routes/user';

export const trpcRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
});
export type TRPCRouter = typeof trpcRouter;
