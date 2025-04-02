import { validateRequest } from "@/lib/auth";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

export const isAuthenticatedFn = createServerFn().handler(async () => {
  const { user } = await validateRequest();
  return !!user;
});

export const assertAuthenticatedFn = createServerFn().handler(async () => {
  const { user } = await validateRequest();

  if (!user) {
    throw redirect({ to: "/login" });
  }

  return user;
});
