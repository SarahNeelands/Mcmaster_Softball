import {Season} from "../models/season_mod"
import * as repo from "../repo/seasons_repo"
import {GetSeasonSeriesIds} from "./series_services"

//==============================================================================
// Season GET functions
//==============================================================================

export async function GetCurrentSeason()
{
    const current = await repo.GetCurrentSeason()
    const games = await GetSeasonSeriesIds(current[0].id)
    const season: Season = {
        id: current[0].id,
        name: current[0].name,
        series_ids: games,
        is_active: current[0].is_active,
        editing_status: current[0].editing_status
    }

    return season;
}