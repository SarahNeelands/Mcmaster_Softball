import { Season } from "../../types/season_mod";
import * as repo from "../repo/seasons_repo";
import { GetSeasonSeriesIds } from "./series_services";
import { GetAllTeamsOfSeason } from "./team_services";

function isAdminOnlySeason(season: Pick<Season, "admin_only"> | null | undefined): boolean {
  return Boolean(season?.admin_only);
}

//==============================================================================
// Season GET functions
//==============================================================================

export async function GetCurrentSeason(includeAdminOnly = false): Promise<Season> {
  const all = await GetAllSeasons(includeAdminOnly);
  const today = new Date().toISOString().slice(0, 10);

  const current = all.find(
    (season) => season.start_date <= today && season.end_date >= today
  );

  if (current) {
    return current;
  }

  const previous = [...all]
    .filter((season) => season.end_date < today)
    .sort((a, b) => b.end_date.localeCompare(a.end_date))[0];

  if (previous) {
    return previous;
  }

  if (all.length > 0) {
    return all[0];
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
    admin_only: false,
    score_notifications_enabled: false,
  };

  const created = await CreateNewSeason(n);
  return await FormatSeason(created);
}

export async function GetAllSeasons(includeAdminOnly = false): Promise<Season[]> {
  const data = await repo.GetAllSeasons();
  const seasons = data && data.length > 0
    ? await Promise.all(data.map((m) => FormatSeason(m)))
    : [];

  return includeAdminOnly ? seasons : seasons.filter((season) => !isAdminOnlySeason(season));
}

export async function GetSeasonById(id: string, includeAdminOnly = false): Promise<Season> {
  const rows = await repo.GetSeasonById(id);

  if (!rows || rows.length === 0) {
    throw new Error(`Season not found: ${id}`);
  }

  const season = await FormatSeason(rows[0]);
  if (!includeAdminOnly && isAdminOnlySeason(season)) {
    throw new Error(`Season not found: ${id}`);
  }

  return season;
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
    admin_only: season.admin_only ?? false,
    score_notifications_enabled: season.score_notifications_enabled ?? false,
    start_date: season.start_date,
    end_date: season.end_date,
  };
}
