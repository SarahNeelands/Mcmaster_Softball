import { NextResponse} from "next/server";
import * as service from "@/backend/services/rule_services";


export async function GET(request: Request) {
  try {
    const rules = await service.GetAllRules()
    return NextResponse.json(rules, {status: 200})

  } catch {
    return NextResponse.json({ error: "Failed to get rules" }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await service.AddNewRule(body);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { data } = body;
    const updated = await service.UpdateRule(data);
    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const result = await service.DeleteRule(body);
    return NextResponse.json(result ?? { ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete Rule" }, { status: 500 });
  }
}