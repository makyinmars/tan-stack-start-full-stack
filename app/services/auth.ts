import { hashPassword } from "@/lib/auth";
import { createUser, getUserByEmail, updateUser } from "./user";
import { createAccount, getAccountByUserId } from "./account";
import { TRPCError } from "@trpc/server";
import { createProfile } from "./profile";
import { createId } from "@paralleldrive/cuid2";
import { deleteVerifyEmailToken, getVerifyEmailToken } from "./verify-email";

export async function verifyPassword(email: string, plainTextPassword: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    return false;
  }

  const account = await getAccountByUserId(user.id);

  if (!account) {
    return false;
  }

  const salt = account.salt;
  const savedPassword = account.password;

  if (!salt || !savedPassword) {
    return false;
  }

  const hash = await hashPassword(plainTextPassword, salt);
  return account.password === hash;
}

export async function signInUseCase(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid email or password",
    });
  }

  const isPasswordCorrect = await verifyPassword(email, password);

  if (!isPasswordCorrect) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid email or password",
    });
  }

  return { id: user.id };
}

export async function registerUserUseCase(email: string, password: string) {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "An user with that email already exists.",
    });
  }
  const user = await createUser(email);
  await createAccount(user?.id as string, password);
  await createProfile(user?.id as string, createId());

  // TODO: setup ses for email verification
  // try {
  //   const token = await createVerifyEmailToken(user.id);
  //   await sendEmail(
  //     email,
  //     `Verify your email for ${applicationName}`,
  //     <VerifyEmail token={ token } />
  //   );
  // } catch (error) {
  //   console.error(
  //     "Verification email would not be sent, did you setup the resend API key?",
  //     error
  //   );
  // }

  return { id: user?.id };
}


export async function verifyEmailUseCase(token: string) {
  const tokenEntry = await getVerifyEmailToken(token);

  if (!tokenEntry) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid token",
    });
  }

  const userId = tokenEntry.userId;

  await updateUser(userId, { emailVerified: new Date() });
  await deleteVerifyEmailToken(token);
  return userId;
}
