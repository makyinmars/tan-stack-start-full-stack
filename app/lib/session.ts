import { UserId } from "~/db/schema";
import { createSession, generateSessionToken, validateRequest } from "./auth";
// import { AuthenticationError } from "~/use-cases/errors";
import { getCookie, setCookie } from "vinxi/http";

const SESSION_COOKIE_NAME = "session";

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date
): Promise<void> {
  setCookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSessionTokenCookie(): Promise<void> {
  setCookie(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const sessionCookie = getCookie(SESSION_COOKIE_NAME);
  return sessionCookie;
}

export const getCurrentUser = async () => {
  const { user } = await validateRequest();
  return user ?? undefined;
};

export const assertAuthenticated = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
};

export async function setSession(userId: UserId) {
  const token = generateSessionToken();
  const session = await createSession(token, userId);
  await setSessionTokenCookie(token, session.expiresAt);
}
