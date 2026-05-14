import { NextResponse } from "next/server";
import * as service from "@/backend/services/score_submission_service";
import { assertCronAuthorized } from "@/lib/server/cronAuth";

function isTorontoSixAmWindow(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "2-digit",
    hourCycle: "h23",
  });

  return formatter.format(now) === "06";
}

async function handleCronRequest(request: Request) {
  try {
    assertCronAuthorized(request);

    if (!isTorontoSixAmWindow()) {
      return NextResponse.json(
        { skipped: true, reason: "Not the 6 AM America/Toronto window." },
        { status: 200 }
      );
    }

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
