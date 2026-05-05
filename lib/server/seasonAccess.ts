import * as seasonService from "@/backend/services/season_services";
import * as seriesRepo from "@/backend/repo/series_repo";
import * as divisionsRepo from "@/backend/repo/divisions_repo";

export async function assertSeasonAccess(seasonId: string, includeAdminOnly = false) {
  await seasonService.GetSeasonById(seasonId, includeAdminOnly);
}

export async function assertSeriesAccess(seriesId: string, includeAdminOnly = false) {
  const series = await seriesRepo.GetSeriesById(seriesId);
  if (!series) {
    throw new Error(`Series not found: ${seriesId}`);
  }

  await assertSeasonAccess(series.season_id, includeAdminOnly);
  return series;
}

export async function assertDivisionAccess(divisionId: string, includeAdminOnly = false) {
  const divisions = await divisionsRepo.GetDivisionsById(divisionId);
  const division = divisions[0];

  if (!division) {
    throw new Error(`Division not found: ${divisionId}`);
  }

  await assertSeriesAccess(division.series_id, includeAdminOnly);
  return division;
}
