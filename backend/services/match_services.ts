import { Match } from "../models/match_mod";
import * as repo from "../repo/matches_repo"

//==============================================================================
// Matches GET functions
//==============================================================================

export async function GetAllSeasonMatches(season_id: string): Promise<Match[]> {
    const data = await repo.GetAllSeasonMatches(season_id);
    return data;
}

//==============================================================================
// Matches Update functions
//==============================================================================

export async function UpdateMatch(update: Match)
{
    const data = await repo.UpdateMatch(update);
    return ;
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
