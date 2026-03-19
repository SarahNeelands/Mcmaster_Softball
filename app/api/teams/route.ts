import { NextResponse} from "next/server";
import * as service from "@/backend/services/team_services";
import { isAdminRequest } from "@/lib/server/adminAuth";
import type { Team } from "@/types/team_mod";

function sanitizeTeam(team: Team): Team {
  return {
    ...team,
    captain_email: "",
    co_captain_email: "",
  };
}

function sanitizeTeamPayload(payload: Team | Team[]) {
  return Array.isArray(payload) ? payload.map(sanitizeTeam) : sanitizeTeam(payload);
}


export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const search = url.searchParams.get("type"); //  "id" | "all" | "slug"
    const isAdmin = await isAdminRequest();

    if (search === "id") {
        if (id === null) {return NextResponse.json({ error: "Failed to get team" }, { status: 500 });}
        const items = await service.GetTeamById(id);
        return NextResponse.json(isAdmin ? items : sanitizeTeamPayload(items), { status: 200 });
    }
    if (search === "all") {
        if (id === null) {return NextResponse.json({ error: "Failed to get teams" }, { status: 500 });}
        const items = await service.GetAllTeamsOfSeason(id);
        return NextResponse.json(isAdmin ? items : sanitizeTeamPayload(items), { status: 200 });
    }
    if (search === "slug") {
        if (id === null) {return NextResponse.json({ error: "Failed to get team" }, { status: 500 });}
        const items = await service.GetTeamBySlug(id);
        return NextResponse.json(isAdmin ? items : sanitizeTeamPayload(items), { status: 200 });
    }
    return NextResponse.json({ error: "Missing or invalid search" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to get season/s" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { season_id, team } = await request.json();

    console.log("POST season_id:", season_id);
    console.log("POST team:", team);

    if (!season_id) return NextResponse.json({ error: "Missing season_id" }, { status: 400 });
    if (!team) return NextResponse.json({ error: "Missing team" }, { status: 400 });

    const created = await service.AddNewTeam(team, season_id);
    console.log("POST created:", created);

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/teams error:", err);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("DELETE body:", body);

    const team = body.data;

    if (!team) {
      return NextResponse.json({ error: "Missing team data" }, { status: 400 });
    }

    const result = await service.DeleteTeam(team);
    return NextResponse.json(result ?? { ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/teams error:", err);
    return NextResponse.json({ error: "Failed to delete Team" }, { status: 500 });
  }
}
