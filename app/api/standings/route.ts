import { NextResponse} from "next/server";
import * as service from "@/backend/services/standing_service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const team_id = url.searchParams.get("team_id");
    const series_id = url.searchParams.get("series_id");
    const division_id = url.searchParams.get("division_id");
    const search = url.searchParams.get("type");

    if (search === "series") {
      if (!series_id) {
        return NextResponse.json({ error: "Missing series_id" }, { status: 400 });
      }
      const items = await service.GetAllSeriesRankings(series_id);
      return NextResponse.json(items ?? [], { status: 200 });
    }

    if (search === "division") {
      if (!division_id) {
        return NextResponse.json({ error: "Missing division_id" }, { status: 400 });
      }
      const items = await service.GetAllDivisionRankings(division_id);
      return NextResponse.json(items ?? [], { status: 200 });
    }

    if (search === "team") {
      if (!team_id || !series_id) {
        return NextResponse.json({ error: "Missing team_id or series_id" }, { status: 400 });
      }
      const items = await service.GetTeamsStanding(team_id, series_id);
      return NextResponse.json(items, { status: 200 });
    }

    return NextResponse.json({ error: "Missing or invalid type" }, { status: 400 });
  } catch (e: unknown) {
    console.error("GET standings route error:", e);
    return NextResponse.json(
      {
        error: "Failed to get standings",
        details: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack ?? null : null,
      },
      { status: 500 }
    );
  }
}
