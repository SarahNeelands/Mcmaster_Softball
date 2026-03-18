import { NextResponse} from "next/server";
import * as service from "@/backend/services/division_services";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const division_id = url.searchParams.get("division_id");
    const series_id = url.searchParams.get("series_id");
    const search = url.searchParams.get("type");

    if (search === "specific") {
      if (!division_id) {
        return NextResponse.json({ error: "Missing division_id" }, { status: 400 });
      }
      const items = await service.GetDivisionById(division_id);
      return NextResponse.json(items, { status: 200 });
    }

    if (search === "all") {
      if (!series_id) {
        return NextResponse.json({ error: "Missing series_id" }, { status: 400 });
      }
      const items = await service.GetAllSeriesDivisions(series_id);
      return NextResponse.json(items ?? [], { status: 200 });
    }

    return NextResponse.json({ error: "Missing or invalid type" }, { status: 400 });
  } catch (e) {
    console.error("GET divisions route error:", e);
    return NextResponse.json({ error: "Failed to get division/s" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await service.CreateDivision(body.division, body.series_id);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("POST divisions route error:", e);
    return NextResponse.json({ error: "Failed to create division" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (body.type === "move_team") {
      if (body.source_division_id) {
        await service.MoveTeamToDivision(
          body.team_id,
          body.source_division_id,
          body.target_division_id
        );
      } else {
        await service.AssignTeamToDivision(
          body.team_id,
          body.series_id,
          body.target_division_id
        );
      }
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const updated = await service.UpdateDivision(body.data);
    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    console.error("PUT divisions route error:", e);
    return NextResponse.json({ error: "Failed to update division" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const deleted = await service.DeleteDivision(body.data);
    return NextResponse.json(deleted, { status: 200 });
  } catch (e) {
    console.error("DELETE divisions route error:", e);
    return NextResponse.json({ error: "Failed to delete division" }, { status: 500 });
  }
}
