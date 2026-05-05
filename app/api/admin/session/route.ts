import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/server/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { isAdmin: await isAdminRequest() },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
