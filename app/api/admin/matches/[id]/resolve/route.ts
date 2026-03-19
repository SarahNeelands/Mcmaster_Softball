import { NextResponse } from "next/server";
import * as service from "@/backend/services/score_submission_service";
import { parseScoreValue } from "@/lib/server/scoreSubmission";
import { isAdminRequest } from "@/lib/server/adminAuth";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const data = await service.getConflictResolutionData(id);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load match." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request, context: Context) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const result = await service.resolveConflict(
      id,
      parseScoreValue(body.homeScore),
      parseScoreValue(body.awayScore)
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to resolve match." },
      { status: 400 }
    );
  }
}
