import { Season } from "../../types/season_mod";
import * as repo from "../repo/seasons_repo";
import { GetSeasonSeriesIds } from "./series_services";
import { GetAllTeamsOfSeason } from "./team_services";

//==============================================================================
// Season GET functions
//==============================================================================

export async function GetCurrentSeason(): Promise<Season> {
  const current = await repo.GetCurrentSeason();

  if (current) {
    return await FormatSeason(current);
  }

  const previous = await repo.GetPreviousSeason();

  if (previous) {
    return await FormatSeason(previous);
  }

  const all = await repo.GetAllSeasons();

  if (all.length > 0) {
    return await FormatSeason(all[0]);
  }

  const date = new Date();
  const year = date.toISOString().slice(0, 4);
  const oneYearFromToday = new Date(date);
  oneYearFromToday.setFullYear(date.getFullYear() + 1);

  const start = date.toISOString().slice(0, 10);
  const end = oneYearFromToday.toISOString().slice(0, 10);

  const n: Season = {
    id: "",
    name: year,
    series_ids: [],
    start_date: start,
    end_date: end,
    editing_status: "draft",
  };

  const created = await CreateNewSeason(n);
  return await FormatSeason(created);
}

export async function GetAllSeasons(): Promise<Season[]> {
  const data = await repo.GetAllSeasons();
  if (data && data.length > 0) {
    return await Promise.all(data.map((m) => FormatSeason(m)));
  }
  return [];
}

export async function GetSeasonById(id: string): Promise<Season> {
  const rows = await repo.GetSeasonById(id);

  if (!rows || rows.length === 0) {
    throw new Error(`Season not found: ${id}`);
  }

  return await FormatSeason(rows[0]);
}

//==============================================================================
// Season CREATE functions
//==============================================================================

// Adds a new season, but carries over the previous team list from the most recent season.
export async function CreateNewSeason(newSeas: Season): Promise<Season> {
  const existing = await repo.GetAllSeasons();

  const created = await repo.AddNewSeason(newSeas);

  if (existing.length > 0) {
    const teams = (await GetAllTeamsOfSeason(existing[0].id)) ?? [];
    if (teams.length > 0) {
      await Promise.all(teams.map((t) => repo.AddNewSeasonTeams(t.id, created.id)));
    }
  }

  return created;
}

//==============================================================================
// Season UPDATE functions
//==============================================================================

export async function UpdateSeason(season: Season): Promise<Season> {
  console.log("service UpdateSeason received:", season);
  const seasonRow = await repo.UpdateSeason(season);

  if (!seasonRow || seasonRow.length === 0) {
    throw new Error(`Failed to update season: ${season.id}`);
  }

  return await FormatSeason(seasonRow[0]);
}

//==============================================================================
// Season DELETE functions
//==============================================================================

export async function DeleteSeason(season: Season) {
  season.editing_status = "deleted";
  return await UpdateSeason(season);
}

//==============================================================================
// Season FORMATTING functions
//==============================================================================

export async function FormatSeason(season: repo.SeasonRow): Promise<Season> {
  const series = await GetSeasonSeriesIds(season.id);
  const ids: string[] = series ?? [];

  return {
    id: season.id,
    name: season.name,
    series_ids: ids,
    editing_status: season.editing_status,
    start_date: season.start_date,
    end_date: season.end_date,
  };
}
