import { NextResponse} from "next/server";
import * as service from "@/backend/services/series_services";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const season_id = url.searchParams.get("season_id");
    const series_id = url.searchParams.get("series_id");
    const search = url.searchParams.get("type");

    if (search === "current") {
      if (!season_id) {
        return NextResponse.json({ error: "Missing season_id" }, { status: 400 });
      }
      const items = await service.GetCurrentSeries(season_id);
      return NextResponse.json(items, { status: 200 });
    }

    if (search === "specific") {
      if (!series_id) {
        return NextResponse.json({ error: "Missing series_id" }, { status: 400 });
      }
      const items = await service.GetSeriesById(series_id);
      return NextResponse.json(items, { status: 200 });
    }

    if (search === "all") {
      if (!season_id) {
        return NextResponse.json({ error: "Missing season_id" }, { status: 400 });
      }
      const items = await service.GetAllSeasonsSeries(season_id);
      return NextResponse.json(items ?? [], { status: 200 });
    }

    return NextResponse.json({ error: "Missing or invalid type" }, { status: 400 });
  } catch (e) {
    console.error("GET series route error:", e);
    return NextResponse.json({ error: "Failed to get series" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await service.CreateNewSeries(body.series, body.season_id);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/series failed:", err);
    return NextResponse.json(
      {
        error: "Failed to create series",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await service.UpdateSeries(body.data);
    return NextResponse.json(updated, { status: 200 });
  } catch (err: unknown) {
    console.error("PUT /api/series failed:", err);
    return NextResponse.json(
      {
        error: "Failed to update series",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const result = await service.DeleteSeries(body.data);
    return NextResponse.json(result ?? { ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete series" }, { status: 500 });
  }
}
