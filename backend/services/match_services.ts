import { Match } from "../../types/match_mod";
import * as repo from "../repo/matches_repo"
import { RecalculateDivisionStandings } from "./standing_service";

//==============================================================================
// Matches GET functions
//==============================================================================

export async function GetAllSeasonMatches(
    season_id: string,
    includeOpenSlotMatches = true
): Promise<Match[]> {
    const data = await repo.GetAllSeasonMatches(season_id, includeOpenSlotMatches);
    if (!data){return []}
    return data;
}

export async function GetTeamsSeasonsMatches(
    team_id: string,
    season_id: string,
    includeOpenSlotMatches = true
): Promise<Match[]> {
        const data = await repo.GetTeamsSeasonsMatches(team_id, season_id, includeOpenSlotMatches);
    if (!data){return []}
    return data;
}

//==============================================================================
// Matches Update functions
//==============================================================================

export async function UpdateMatch(update: Match)
{
    const existing = await repo.GetMatchById(update.id);
    if (!existing) {
        throw new Error(`Match not found: ${update.id}`);
    }

    if (!update.division_id) {
        update.division_id = existing.division_id;
    }

    if (
        update.home_score !== null &&
        update.away_score !== null &&
        update.score_status !== "published_single_submission"
    ) {
        update.score_status = "finalized";
        update.finalized_at = update.finalized_at ?? new Date().toISOString();
    }

    const data = await repo.UpdateMatch(update);
    const divisionIdsToRecalculate = new Set<string>();
    const existingWasOfficial = existing.home_score !== null && existing.away_score !== null;
    const updatedIsOfficial = data.home_score !== null && data.away_score !== null;

    if (existingWasOfficial && existing.division_id) {
        divisionIdsToRecalculate.add(existing.division_id);
    }

    if (updatedIsOfficial && data.division_id) {
        divisionIdsToRecalculate.add(data.division_id);
    }

    await Promise.all(
        Array.from(divisionIdsToRecalculate).map((division_id) =>
            RecalculateDivisionStandings(division_id)
        )
    );
    return data;
}

//==============================================================================
// Matches Delete functions
//==============================================================================
export async function DeleteMatch(match: Match) 
{
    match.editing_status = "deleted";
    const data = await UpdateMatch(match);
    return data;
}

//==============================================================================
// Matches Create functions
//==============================================================================
export async function AddNewMatch(match: Match) 
{
    if (!match.division_id) {
        throw new Error("Match division_id is required.");
    }
    const data = await repo.AddNewMatch(match);
    return data;
}
