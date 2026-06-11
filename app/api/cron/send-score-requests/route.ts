import { NextResponse } from "next/server";
import * as service from "@/backend/services/score_submission_service";
import { assertCronAuthorized } from "@/lib/server/cronAuth";

async function handleCronRequest(request: Request) {
  try {
    assertCronAuthorized(request);

    const result = await service.runDailyScoreCron();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? ((error as { status: number }).status)
        : 500;

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send score requests." },
      { status }
    );
  }
}

export async function GET(request: Request) {
  return handleCronRequest(request);
}

export async function POST(request: Request) {
  return handleCronRequest(request);
}
