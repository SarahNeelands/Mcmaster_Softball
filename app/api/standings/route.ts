import { NextResponse} from "next/server";
import * as service from "@/backend/services/standing_service";
import { isAdminRequest } from "@/lib/server/adminAuth";
import { assertDivisionAccess, assertSeriesAccess } from "@/lib/server/seasonAccess";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const isAdmin = await isAdminRequest();
    const url = new URL(request.url);
    const team_id = url.searchParams.get("team_id")?.trim() || null;
    const series_id = url.searchParams.get("series_id")?.trim() || null;
    const division_id = url.searchParams.get("division_id")?.trim() || null;
    const search = url.searchParams.get("type")?.trim();

    if (search === "series") {
      if (!series_id) {
        return NextResponse.json({ error: "Missing series_id" }, { status: 400 });
      }
      await assertSeriesAccess(series_id, isAdmin);
      const items = await service.GetAllSeriesRankings(series_id);
      return NextResponse.json(items ?? [], { status: 200 });
    }

    if (search === "division") {
      if (!division_id) {
        return NextResponse.json({ error: "Missing division_id" }, { status: 400 });
      }
      await assertDivisionAccess(division_id, isAdmin);
      const items = await service.GetAllDivisionRankings(division_id);
      return NextResponse.json(items ?? [], { status: 200 });
    }

    if (search === "team") {
      if (!team_id || !series_id) {
        return NextResponse.json({ error: "Missing team_id or series_id" }, { status: 400 });
      }
      await assertSeriesAccess(series_id, isAdmin);
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
