"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDaysToIsoDate = addDaysToIsoDate;
exports.isDateBefore = isDateBefore;
exports.buildNextSeriesName = buildNextSeriesName;
exports.shouldCreateFollowupSeries = shouldCreateFollowupSeries;
exports.findExistingFollowupSeries = findExistingFollowupSeries;
exports.buildFollowupSeriesPayload = buildFollowupSeriesPayload;
function addDaysToIsoDate(isoDate, days) {
    const [year, month, day] = isoDate.split("-").map(Number);
    const next = new Date(Date.UTC(year, month - 1, day));
    next.setUTCDate(next.getUTCDate() + days);
    return next.toISOString().slice(0, 10);
}
function isDateBefore(left, right) {
    return left < right;
}
function buildNextSeriesName(existingSeries) {
    const maxSeriesNumber = existingSeries.reduce((max, series) => {
        const match = series.name.match(/series\s+(\d+)/i);
        const parsed = match ? Number(match[1]) : NaN;
        return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
    }, 0);
    return `Series ${maxSeriesNumber + 1 || existingSeries.length + 1}`;
}
function shouldCreateFollowupSeries(previousSeries, season) {
    return Boolean(previousSeries && isDateBefore(previousSeries.end_date, season.end_date));
}
function findExistingFollowupSeries(existingSeries, previousSeriesEndDate) {
    const nextStartDate = addDaysToIsoDate(previousSeriesEndDate, 1);
    return existingSeries.find((series) => series.start_date === nextStartDate) ?? null;
}
function buildFollowupSeriesPayload(previousSeries, season, existingSeries) {
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
