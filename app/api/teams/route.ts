import { NextResponse} from "next/server";
import * as service from "@/backend/services/team_services";


export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("season_id");
    const search = url.searchParams.get("type"); //  "specific" | "all"

    if (search === "specific") {
        if (id === null) {return NextResponse.json({ error: "Failed to get team" }, { status: 500 });}
        const items = await service.GetTeamById(id);
        return NextResponse.json(items, { status: 200 });
    }
    if (search === "all") {
        if (id === null) {return NextResponse.json({ error: "Failed to get teams" }, { status: 500 });}
        const items = await service.GetAllTeamsOfSeason(id);
        return NextResponse.json(items, { status: 200 });
    }
    return NextResponse.json({ error: "Missing or invalid search" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to get season/s" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { season_id, team } = await request.json();

    if (!season_id) return NextResponse.json({ error: "Missing season_id" }, { status: 400 });
    if (!team) return NextResponse.json({ error: "Missing team" }, { status: 400 });

    const created = await service.AddNewTeam(season_id, team);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { data } = body;
    const updated = await service.UpdateTeam(data);
    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const result = await service.DeleteTeam(body);
    return NextResponse.json(result ?? { ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete Team" }, { status: 500 });
  }
}