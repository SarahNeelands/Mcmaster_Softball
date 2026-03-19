import { NextResponse } from "next/server";
import * as service from "@/backend/services/score_submission_service";
import { parseScoreValue } from "@/lib/server/scoreSubmission";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }

    const data = await service.getSubmissionPageData(token);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to validate token." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (!token) {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }

    const result = await service.submitScore({
      token,
      homeScore: parseScoreValue(body.homeScore),
      awayScore: parseScoreValue(body.awayScore),
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit score." },
      { status: 400 }
    );
  }
}
