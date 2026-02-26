import { NextResponse} from "next/server";
import * as service from "@/backend/services/match_services";


export async function GET(request: Request) {
  try {
    const matches = await service.GetAllMatches()
    return NextResponse.json(matches, {status: 200})

  } catch {
    return NextResponse.json({ error: "Failed to get matches" }, { status: 500 });
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