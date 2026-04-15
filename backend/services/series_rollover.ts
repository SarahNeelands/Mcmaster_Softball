import type { Series } from "../../types/series_mod";
import type { SeasonRow } from "../repo/seasons_repo";
import type { SeriesRow } from "../repo/series_repo";

export function addDaysToIsoDate(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day));
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function isDateBefore(left: string, right: string): boolean {
  return left < right;
}

export function buildNextSeriesName(existingSeries: SeriesRow[]): string {
  const maxSeriesNumber = existingSeries.reduce((max, series) => {
    const match = series.name.match(/series\s+(\d+)/i);
    const parsed = match ? Number(match[1]) : NaN;
    return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
  }, 0);

  return `Series ${maxSeriesNumber + 1 || existingSeries.length + 1}`;
}

export function shouldCreateFollowupSeries(
  previousSeries: Pick<SeriesRow, "end_date"> | null,
  season: Pick<SeasonRow, "end_date">
): boolean {
  return Boolean(previousSeries && isDateBefore(previousSeries.end_date, season.end_date));
}

export function findExistingFollowupSeries(
  existingSeries: Pick<SeriesRow, "start_date">[],
  previousSeriesEndDate: string
) {
  const nextStartDate = addDaysToIsoDate(previousSeriesEndDate, 1);
  return existingSeries.find((series) => series.start_date === nextStartDate) ?? null;
}

export function buildFollowupSeriesPayload(
  previousSeries: Pick<
    SeriesRow,
    "name" | "end_date" | "advance_amount" | "demote_amount"
  >,
  season: Pick<SeasonRow, "id" | "end_date">,
  existingSeries: SeriesRow[]
): Omit<Series, "id"> & { id: string } {
  return {
    id: "",
    name: buildNextSeriesName(existingSeries),
    divisions_ids: [],
    start_date: addDaysToIsoDate(previousSeries.end_date, 1),
    end_date: season.end_date,
    advance_amount: previousSeries.advance_amount,
    demote_amount: previousSeries.demote_amount,
    editing_status: "draft",
  };
}
