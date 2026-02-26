import { Team } from "../models/team_mod";
import * as repo from "../repo/teams_repo"
import { GetCurrentSeason } from "../repo/seasons_repo";

//==============================================================================
// Team GET functions
//==============================================================================

export async function GetAllTeamsOfSeason(season_id: string): Promise<string[]> {
    const data = await repo.GetAllTeamsOfSeason(season_id);
    return data;
}


//==============================================================================
// Team ADD functions
//==============================================================================


