import {Season} from "../models/season_mod"
import * as repo from "../repo/seasons_repo"
import {GetSeasonSeriesIds} from "./series_services"
import {GetAllTeamsOfSeason} from "./team_services"

//==============================================================================
// Season GET functions
//==============================================================================

export async function GetCurrentSeason()
{
    const current = await repo.GetCurrentSeason()
    const season = FormatSeason(current);
    return season;
}

export async function GetAllSeasons(): Promise<Season[]> {
    const data = await repo.GetAllSeasons();
    const seasons = await Promise.all(data.map((m) => FormatSeason(m)))
    return seasons
}

export async function GetSeasonById(id:string): Promise<Season> {
    const season = await repo.GetSeasonById(id);
    return FormatSeason(season);
}
//==============================================================================
// Season CREATE functions
//==============================================================================

// adds a new season, but caries over the previous team list from that season.
export async function CreateNewSeason(newSeas: Season): Promise<Season>
{
    const data = await repo.GetAllSeasons();
    const mostRecent = FormatSeason(data[0]);
    const teams = await GetAllTeamsOfSeason(data[0].id);
    const season = await repo.AddNewSeason(newSeas);
    const add = teams.map((m) => repo.AddNewSeasonTeams(m, season.id))
    return season;
}
//==============================================================================
// Season UPDATE functions
//==============================================================================
export async function UpdateSeason(season: Season): Promise<Season>
{
    const seasonRow = await repo.UpdateSeason(season);
    return FormatSeason(seasonRow);
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
    const formatedSeason: Season = {
        id: season.id,
        name: season.name,
        series_ids: series,
        editing_status: season.editing_status,
        start_date: season.start_date,
        end_date: season.end_date
    }
    return formatedSeason;
}
