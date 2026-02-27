import { NextResponse} from "next/server";
import * as service from "@/backend/services/season_services";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const season_id = url.searchParams.get("season_id");
    const search = url.searchParams.get("type"); // "current" | "specific" | "all"

    if (search === "current") {
      const items = await service.GetCurrentSeason();
      return NextResponse.json(items, { status: 200 });
    }

    if (search === "specific") {
      if (!season_id) {
        return NextResponse.json({ error: "Missing season_id" }, { status: 400 });
      }
      const items = await service.GetSeasonById(season_id);
      return NextResponse.json(items, { status: 200 });
    }

    if (search === "all") {
      const items = await service.GetAllSeasons();
      return NextResponse.json(items ?? [], { status: 200 });
    }

    return NextResponse.json({ error: "Missing or invalid type" }, { status: 400 });
  } catch (e) {
    console.error("GET seasons route error:", e);
    return NextResponse.json({ error: "Failed to get season/s" }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await service.CreateNewSeason(body);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create season" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { data } = body;
    const updated = await service.UpdateSeason(data);
    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update season" }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const result = await service.DeleteSeason(body);
    return NextResponse.json(result ?? { ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete season" }, { status: 500 });
  }
}