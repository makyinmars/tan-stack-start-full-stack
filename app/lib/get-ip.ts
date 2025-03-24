import { getRequestHeader } from "vinxi/http";

// TODO: Fix this for tanstack starter kit
export async function getIp() {
  const forwardedFor = getRequestHeader("x-forwarded-for");
  console.log("forwardedFor", forwardedFor)
  const realIp = getRequestHeader("x-real-ip");
  console.log("realIp", realIp)

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return null;
}
