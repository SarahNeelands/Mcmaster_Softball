import {Standing} from "@/types/standing_mod"
import * as repo from "../repo/standings_repo"
import { GetTeamById } from "./team_services";

//==============================================================================
// Standing GET functions
//==============================================================================

export async function GetAllSeriesRankings(series_id: string): Promise<Standing[]> {
  const data = await repo.GetStandingsBySeries(series_id);

  if (!data || data.length === 0) {
    return [];
  }

  return Promise.all(data.map((m) => FormatStanding(m)));
}

export async function GetAllDivisionRankings(division_id: string): Promise<Standing[]> {
  const data = await repo.GetStandingsByDivision(division_id);

  if (!data || data.length === 0) {
    return [];
  }

  return Promise.all(data.map((m) => FormatStanding(m)));
}

export async function GetTeamsStanding(
  team_id: string,
  series_id: string
): Promise<Standing | null> {
  const data = await repo.GetStandingsByTeam(team_id, series_id);

  if (!data) {
    return null;
  }

  return FormatStanding(data);
}

//==============================================================================
// Standing CREATE functions
//==============================================================================




//==============================================================================
// Standing Formate functions
//==============================================================================

export async function FormatStanding(stand: repo.StandingRow): Promise<Standing> {
  const team = await GetTeamById(stand.team_id);
  const standing: Standing =
  {
  id: stand.id,
  division_id: stand.division_id,
  team: team,
  wins: stand.wins,
  losses: stand.losses,
  ties: stand.ties,
  points: stand.points,
  series_id: stand.series_id,
  editing_status: stand.editing_status
  };
  return standing;
}
