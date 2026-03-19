import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/server/adminAuth";

export async function GET() {
  return NextResponse.json({ isAdmin: await isAdminRequest() }, { status: 200 });
}
