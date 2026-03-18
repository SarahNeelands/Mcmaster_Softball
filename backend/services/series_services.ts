import {Series} from "../../types/series_mod"
import * as repo from "../repo/series_repo"
import * as seasonRepo from "../repo/seasons_repo"
import { GetSeriesDivisionIds, SeedSeriesDivisionsFromPreviousSeries } from "./division_services"


//==============================================================================
// Series GET functions
//==============================================================================
export async function GetCurrentSeries(season_id: string): Promise<Series> {
    const current = await repo.GetCurrentSeries(season_id);

    if (current) {
        return await FormatSeries(current);
    }

    const previous = await repo.GetPreviousSeries(season_id);
    if (previous) {
        return await FormatSeries(previous);
    }

    const seasons = await seasonRepo.GetSeasonById(season_id);
    if (!seasons || seasons.length === 0) {
        throw new Error(`Season not found: ${season_id}`);
    }

    const season = seasons[0];
    const n: Series = {
        id: "",
        name: "Series 1",
        divisions_ids: [],
        start_date: season.start_date,
        end_date: season.end_date,
        advance_amount: 1,
        demote_amount: 1,
        editing_status: "draft",
    };

    return await CreateNewSeries(n, season_id);
}

export async function GetAllSeasonsSeries(season_id: string): Promise<Series[]> {
    const data = await repo.GetAllSeasonsSeries(season_id);
    if (data && data.length > 0) {
        return await Promise.all(data.map((series) => FormatSeries(series)));
    }
    return [];
}

export async function GetSeriesById(id: string): Promise<Series> {
    const row = await repo.GetSeriesById(id);

    if (!row) {
        throw new Error(`Series not found: ${id}`);
    }

    return await FormatSeries(row);
}

export async function GetSeasonSeriesIds(season_id: string): Promise<string[]> {
    const ids = await repo.GetSeasonSeriesIds(season_id);
    return ids;
}

//==============================================================================
// Series CREATE functions
//==============================================================================

export async function CreateNewSeries(series: Series, season_id: string): Promise<Series> {
    const existingSeries = await repo.GetAllSeasonsSeries(season_id);
    const created = await repo.AddNewSeries(series, season_id);
    const latestPreviousSeries = existingSeries[0];

    if (latestPreviousSeries) {
        await SeedSeriesDivisionsFromPreviousSeries(
            latestPreviousSeries.id,
            created.id,
            created.advance_amount,
            created.demote_amount
        );
    }

    return await FormatSeries(created);
}

//==============================================================================
// Series UPDATE functions
//==============================================================================

export async function UpdateSeries(series: Series): Promise<Series> {
    const row = await repo.UpdateSeriesById(series);
    return await FormatSeries(row);
}

//==============================================================================
// Series DELETE functions
//==============================================================================

export async function DeleteSeries(series: Series): Promise<Series> {
    series.editing_status = "deleted";
    return await UpdateSeries(series);
}

//==============================================================================
// Series FORMATTING functions
//==============================================================================

export async function FormatSeries(series: repo.SeriesRow): Promise<Series> {
    const divisions = await GetSeriesDivisionIds(series.id);

    return {
        id: series.id,
        name: series.name,
        start_date: series.start_date,
        end_date: series.end_date,
        divisions_ids: divisions ?? [],
        advance_amount: series.advance_amount,
        demote_amount: series.demote_amount,
        editing_status: series.editing_status ?? "draft",
    };
}
