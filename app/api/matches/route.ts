import { NextResponse} from "next/server";
import * as service from "@/backend/services/match_services";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const type = url.searchParams.get("type");
    const seasonId = url.searchParams.get("season_id");
    const teamId = url.searchParams.get("team_id");

    console.log("GET /api/matches", {
      type,
      seasonId,
      teamId,
    });

    if (!type) {
      return NextResponse.json(
        { error: "type required. Use 'all' or 'team'" },
        { status: 400 }
      );
    }

    if (!seasonId) {
      return NextResponse.json(
        { error: "season_id required" },
        { status: 400 }
      );
    }

    if (type === "all") {
      const matches = await service.GetAllSeasonMatches(seasonId);
      return NextResponse.json(matches, { status: 200 });
    }

    if (type === "team") {
      if (!teamId) {
        return NextResponse.json(
          { error: "team_id required when type=team" },
          { status: 400 }
        );
      }

      const matches = await service.GetTeamsSeasonsMatches(teamId, seasonId);
      return NextResponse.json(matches, { status: 200 });
    }

    return NextResponse.json(
      { error: "invalid type. Use 'all' or 'team'" },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("GET /api/matches failed:", err);

    return NextResponse.json(
      {
        error: "Failed to fetch matches",
        details: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack ?? null : null,
      },
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
    const result = await service.DeleteMatch(body.data);
    return NextResponse.json(result ?? { ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}
