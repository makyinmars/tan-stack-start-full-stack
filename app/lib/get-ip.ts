import { getRequestHeader } from "vinxi/http";

export async function getIp() {
  const forwardedFor = getRequestHeader("x-forwarded-for");
  const realIp = getRequestHeader("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return null;
}
