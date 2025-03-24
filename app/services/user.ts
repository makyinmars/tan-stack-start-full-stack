import { db } from "@/db";
import { User, UserId, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserByEmail(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  return user;
}

export async function createUser(email: string) {
  const [user] = await db
    .insert(users)
    .values({
      email,
    })
    .returning();
  return user;
}

export async function updateUser(userId: UserId, updatedUser: Partial<User>) {
  await db.update(users).set(updatedUser).where(eq(users.id, userId));
}
