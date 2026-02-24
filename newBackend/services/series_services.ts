import {Series} from "../models/series_mod"
import * as repo from "../repo/series_repo"
import { GetAllSeriesDivisions } from "../repo/divisions_repo"


//==============================================================================
// Series GET functions
//==============================================================================
export async function GetSeasonSeriesIds(season_id: string)
{
    const ids = await repo.GetSeasonSeriesIds(season_id);
    return ids;

}
