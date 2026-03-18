import { Match } from "../../types/match_mod";
import * as repo from "../repo/matches_repo"

//==============================================================================
// Matches GET functions
//==============================================================================

export async function GetAllSeasonMatches(season_id: string): Promise<Match[]> {
    const data = await repo.GetAllSeasonMatches(season_id);
    if (!data){return []}
    return data;
}

export async function GetTeamsSeasonsMatches(team_id: string, season_id: string): Promise<Match[]> {
        const data = await repo.GetTeamsSeasonsMatches(team_id, season_id);
    if (!data){return []}
    return data;
}

//==============================================================================
// Matches Update functions
//==============================================================================

export async function UpdateMatch(update: Match)
{
    const data = await repo.UpdateMatch(update);
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
    const data = await repo.AddNewMatch(match);
    return data;
}
