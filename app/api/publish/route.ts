import { NextResponse } from "next/server";
import * as service from "@/backend/services/publish_services";

export async function POST() {
  try {
    const result = await service.Publish();
    return NextResponse.json(result ?? { ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/publish failed:", err);
    return NextResponse.json(
      { error: "Failed to publish", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}