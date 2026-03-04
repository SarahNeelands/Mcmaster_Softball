import {Season} from "../models/season_mod"
import * as repo from "../repo/seasons_repo"
import {GetSeasonSeriesIds} from "./series_services"
import {GetAllTeamsOfSeason} from "./team_services"

//==============================================================================
// Season GET functions
//==============================================================================

export async function GetCurrentSeason(): Promise<Season> {
  const current = await repo.GetCurrentSeason();

  if (current) {
    return await FormatSeason(current);
  }

  const all = await repo.GetAllSeasons();

  if (all && all.length > 0) {
    return await FormatSeason(all[0]);
  }

  // none exist, create one
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const year = new Date().toISOString().slice(0, 4);
    const n: Season = {
        id: "",
        name: year,
        series_ids: [],
        start_date: today,
        end_date: today,          // or set a real end date
        editing_status: "draft",
    }
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

export async function GetSeasonById(id:string): Promise<Season> {
    const season = await repo.GetSeasonById(id);
    return FormatSeason(season[0]);
}
//==============================================================================
// Season CREATE functions
//==============================================================================

// adds a new season, but caries over the previous team list from that season.
export async function CreateNewSeason(newSeas: Season): Promise<Season>
{
    const data = await repo.GetAllSeasons();
    const season = await repo.AddNewSeason(newSeas);
    if (data.length>0)
    {
        const teams = await GetAllTeamsOfSeason(data[0].id);
        const add = teams.map((m) => repo.AddNewSeasonTeams(m, season.id))
    }
    const mostRecent = await FormatSeason(data[0]);
    return season;
}
//==============================================================================
// Season UPDATE functions
//==============================================================================
export async function UpdateSeason(season: Season): Promise<Season>
{
    const seasonRow = await repo.UpdateSeason(season);
    return FormatSeason(seasonRow[0]);
}
//==============================================================================
// Season DELETE functions
//==============================================================================

export async function DeleteSeason(season: Season) 
{
    season.editing_status = "deleted";
    const data = await UpdateSeason(season);
    return data;
}

//==============================================================================
// Season FORMATING functions
//==============================================================================

export async function FormatSeason(season: repo.SeasonRow): Promise<Season> {
    const series = await GetSeasonSeriesIds(season.id)
    let ids: string[] = [];
    if (series)
    {
        ids = series;
    }
    const formatedSeason: Season = {
        id: season.id,
        name: season.name,
        series_ids: ids,
        editing_status: season.editing_status,
        start_date: season.start_date,
        end_date: season.end_date
    }
    return formatedSeason;
}
