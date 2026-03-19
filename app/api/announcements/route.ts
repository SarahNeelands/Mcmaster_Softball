import { NextResponse } from "next/server";
import * as service from "@/backend/services/announcement_services";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const season_id = url.searchParams.get("season_id");
    const status = url.searchParams.get("status"); // "active" | "archived"

    if (!season_id) {
      return NextResponse.json({ error: "Missing season_id" }, { status: 400 });
    }

    if (status === "active") {
      const items = await service.GetActiveAnnouncements(season_id);
      return NextResponse.json(items, { status: 200 });
    }

    if (status === "archived") {
      const items = await service.GetArchivedAnnouncements(season_id);
      return NextResponse.json(items, { status: 200 });
    }

    return NextResponse.json({ error: "Missing or invalid status" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to get announcements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("POST /api/announcements body:", body);

    const created = await service.AddNewAnnouncement(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/announcements failed:", err);

    return NextResponse.json(
      {
        error: "Failed to create announcement",
        details: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack ?? null : null,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    console.log("PUT /api/announcements body:", body);

    const update = body.data ?? body; // supports both shapes
    const updated = await service.UpdateAnnouncement(update);

    return NextResponse.json(updated, { status: 200 });
  } catch (err: unknown) {
    console.error("PUT /api/announcements failed:", err);
    return NextResponse.json(
      {
        error: "Failed to update announcement",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const result = await service.DeleteAnnouncement(body);
    return NextResponse.json(result ?? { ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
