import { NextResponse } from "next/server";
import * as service from "@/backend/services/publish_services";

export async function POST() {
  try {
    const result = await service.Revert();
    return NextResponse.json(result ?? { ok: true }, { status: 200 });
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : String(err);
    console.error("POST /api/publish/revert failed:", err);
    return NextResponse.json(
      { error: "Failed to revert unpublished changes", details },
      { status: 500 }
    );
  }
}
