import { NextResponse} from "next/server";
import * as service from "@/backend/services/publish_services";

export async function DELETE() {
  try {
    const result = await service.Publish();
    return NextResponse.json(result ?? { ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
  }
}