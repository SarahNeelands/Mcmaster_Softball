import {Standing} from "@/types/standing_mod"
import * as repo from "../repo/standings_repo"
import { GetTeamById } from "./team_services";
import * as divisionsRepo from "../repo/divisions_repo";
import * as matchesRepo from "../repo/matches_repo";

//==============================================================================
// Standing GET functions
//==============================================================================

export async function GetAllSeriesRankings(series_id: string): Promise<Standing[]> {
  const divisionIds = await divisionsRepo.GetSeriesDivisionIds(series_id);
  await Promise.all(divisionIds.map((division_id) => RecalculateDivisionStandings(division_id)));

  const data = await repo.GetStandingsBySeries(series_id);

  if (!data || data.length === 0) {
    return [];
  }

  return Promise.all(data.map((m) => FormatStanding(m)));
}

export async function GetAllDivisionRankings(division_id: string): Promise<Standing[]> {
  await RecalculateDivisionStandings(division_id);

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
  const divisionIds = await divisionsRepo.GetSeriesDivisionIds(series_id);
  await Promise.all(divisionIds.map((division_id) => RecalculateDivisionStandings(division_id)));

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

export async function RecalculateDivisionStandings(division_id: string): Promise<void> {
  const [divisionRows, standingRows, matches] = await Promise.all([
    divisionsRepo.GetDivisionsById(division_id),
    repo.GetStandingsByDivision(division_id),
    matchesRepo.GetOfficialDivisionMatches(division_id),
  ]);

  const division = divisionRows[0];
  if (!division) {
    throw new Error(`Division not found: ${division_id}`);
  }

  await repo.ResetDivisionStandings(division_id);

  const totals = new Map<string, { wins: number; losses: number; ties: number; points: number }>();

  for (const standing of standingRows) {
    totals.set(standing.team_id, { wins: 0, losses: 0, ties: 0, points: 0 });
  }

  for (const match of matches) {
    const home = totals.get(match.home_team_id);
    const away = totals.get(match.away_team_id);

    if (!home || !away || match.home_score === null || match.away_score === null) {
      continue;
    }

    if (match.home_score > match.away_score) {
      home.wins += 1;
      home.points += division.win_points;
      away.losses += 1;
      away.points += division.loss_points;
      continue;
    }

    if (match.home_score < match.away_score) {
      away.wins += 1;
      away.points += division.win_points;
      home.losses += 1;
      home.points += division.loss_points;
      continue;
    }

    home.ties += 1;
    away.ties += 1;
    home.points += division.tie_points;
    away.points += division.tie_points;
  }

  await Promise.all(
    standingRows.map(async (standing) => {
      const total = totals.get(standing.team_id);
      if (!total) return;

      const team = await GetTeamById(standing.team_id);
      await repo.UpdateStandings({
        id: standing.id,
        division_id: standing.division_id,
        team,
        wins: total.wins,
        losses: total.losses,
        ties: total.ties,
        points: total.points,
        series_id: standing.series_id,
        editing_status: standing.editing_status,
      });
    })
  );
}
