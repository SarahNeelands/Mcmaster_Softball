import { Team } from "../../types/team_mod";
import * as repo from "../repo/teams_repo"


//==============================================================================
// Team GET functions
//==============================================================================

export async function GetAllTeamsOfSeason(season_id: string): Promise<Team[]> {
    const data = await repo.GetAllTeamsOfSeason(season_id);
    const teams = Promise.all(data.map((id) => repo.GetTeamById(id)));
    return teams;
}

export async function GetTeamById(id: string): Promise<Team> 
{
    return await repo.GetTeamById(id);
}

export async function GetTeamBySlug(slug: string): Promise<Team> 
{
    return await repo.GetTeamBySlug(slug);
}
//==============================================================================
// Team ADD functions
//==============================================================================


export async function AddNewTeam(team: Team, season_id: string): Promise<Team> {
  const slug = makeSlug(team.name);
  team.slug = slug;


  console.log("++++++++got it++++++++++++++++");
  console.log(season_id);

  return await repo.AddNewTeam(team, season_id);
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
//==============================================================================
// Team Helper functions
//==============================================================================
function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}