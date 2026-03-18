
import { NextResponse } from "next/server";

import crypto from "node:crypto";

const cookieName = "msadmin_session";

function sign(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD;
    const cookieSecret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;

    if (!adminPassword || !cookieSecret) {
      return NextResponse.json(
        { error: "Server auth environment variables are missing." },
        { status: 500 }
      );
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const payload = "msadmin-authenticated";
    const signature = sign(payload, cookieSecret);
    const token = signature;

    const res = NextResponse.json({ ok: true });

    res.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
