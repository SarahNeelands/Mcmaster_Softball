import { createHmac } from "crypto";
import { cookies } from "next/headers";

const cookieName = "msadmin_session";

export function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_COOKIE_SECRET || process.env.ADMIN_PASSWORD || "msadmin";
}

export function getExpectedAdminToken() {
  return createHmac("sha256", getAdminSessionSecret())
    .update("msadmin-authenticated")
    .digest("hex");
}

export async function isAdminRequest() {
  const cookieStore = await cookies();
  return cookieStore.get(cookieName)?.value === getExpectedAdminToken();
}
