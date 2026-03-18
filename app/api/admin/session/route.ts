import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const cookieName = "msadmin_session";

function getExpectedToken() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "msadmin";
  return createHmac("sha256", secret).update("msadmin-authenticated").digest("hex");
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  return NextResponse.json({ isAdmin: token === getExpectedToken() }, { status: 200 });
}
