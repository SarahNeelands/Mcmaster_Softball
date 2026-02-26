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

export async function GetTeamById(id: string): Promise<Team> 
{
    return await repo.GetTeamById(id);
}
//==============================================================================
// Team ADD functions
//==============================================================================


export async function AddNewTeam(team: Team): Promise<Team> 
{
    return await repo.AddNewTeam(team);
}


//==============================================================================
// Team UPDATE functions
//==============================================================================

export async function UpdateTeam(team:Team): Promise<Team>
{
    return await repo.UpdateTeam(team);
}


//==============================================================================
// Team Deleting functions
//==============================================================================

export async function DeleteTeam(team: Team) 
{
    team.editing_status = "deleted";
    const data = await UpdateTeam(team);
    return data;
}