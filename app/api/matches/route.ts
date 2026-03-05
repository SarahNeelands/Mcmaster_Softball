import { NextResponse} from "next/server";
import * as service from "@/backend/services/match_services";



export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const seasonId = url.searchParams.get("season_id");
    console.log("GET /api/matches season_id:", seasonId);

    if (!seasonId) {
      return NextResponse.json({ error: "season_id required" }, { status: 400 });
    }

    const matches = await service.GetAllSeasonMatches(seasonId); // rename to yours
    return NextResponse.json(matches, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/matches failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch matches", details: err?.message ?? String(err), stack: err?.stack ?? null },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await service.AddNewMatch(body);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { data } = body;
    const updated = await service.UpdateMatch(data);
    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const result = await service.DeleteMatch(body);
    return NextResponse.json(result ?? { ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}