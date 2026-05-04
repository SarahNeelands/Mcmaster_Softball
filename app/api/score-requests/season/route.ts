import { NextResponse } from "next/server";
import * as scoreService from "@/backend/services/score_submission_service";
import * as seasonService from "@/backend/services/season_services";
import { isAdminRequest } from "@/lib/server/adminAuth";

export async function POST(request: Request) {
  try {
    const isAdmin = await isAdminRequest();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const seasonId = body.season_id as string | undefined;

    if (!seasonId) {
      return NextResponse.json({ error: "Missing season_id" }, { status: 400 });
    }

    const season = await seasonService.GetSeasonById(seasonId, true);
    if (!season.admin_only) {
      return NextResponse.json({ error: "Only Tester seasons can use this control." }, { status: 400 });
    }

    if (!season.score_notifications_enabled) {
      return NextResponse.json({ preparedMatchIds: [] }, { status: 200 });
    }

    const result = await scoreService.prepareScoreRequestsForSeason(seasonId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to prepare score requests." },
      { status: 500 }
    );
  }
}
