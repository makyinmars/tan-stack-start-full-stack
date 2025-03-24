import { db } from "@/db";
import { type Profile, profiles, type UserId } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProfile(profileId: string) {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
  });

  return profile;
}

export async function getProfileByUserId(userId: UserId) {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  return profile;
}

export type GetProfileResult = Awaited<ReturnType<typeof getProfile>>;

export async function createProfile(
  userId: UserId,
  displayName?: string,
  image?: string,
  imageId?: string,
  bio?: string
) {
  const [profile] = await db
    .insert(profiles)
    .values({
      userId,
      displayName,
      image,
      imageId,
      bio: bio || "",
    })
    .returning();

  return profile;
}

export async function updateProfile(
  profileId: string,
  updatedProfile: Partial<Profile>
) {
  await db
    .update(profiles)
    .set(updatedProfile)
    .where(eq(profiles.id, profileId));

  return getProfile(profileId);
}

export async function updateProfileByUserId(
  userId: UserId,
  updatedProfile: Partial<Profile>
) {
  await db
    .update(profiles)
    .set(updatedProfile)
    .where(eq(profiles.userId, userId));

  return getProfileByUserId(userId);
}

export async function deleteProfile(profileId: string) {
  await db.delete(profiles).where(eq(profiles.id, profileId));
}

export async function deleteProfileByUserId(userId: UserId) {
  await db.delete(profiles).where(eq(profiles.userId, userId));
}
