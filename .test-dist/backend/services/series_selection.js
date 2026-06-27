"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectCurrentOrMostRecentSeries = selectCurrentOrMostRecentSeries;
function toDateOnly(value) {
    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }
    if (typeof value === "number") {
        return new Date(value).toISOString().slice(0, 10);
    }
    return String(value).slice(0, 10);
}
function selectCurrentOrMostRecentSeries(series, today) {
    const normalizedToday = toDateOnly(today);
    const current = series.find((item) => {
        const start = toDateOnly(item.start_date);
        const end = toDateOnly(item.end_date);
        return start <= normalizedToday && end >= normalizedToday;
    });
    if (current) {
        return current;
    }
    const previous = [...series]
        .filter((item) => toDateOnly(item.end_date) < normalizedToday)
        .sort((a, b) => toDateOnly(b.end_date).localeCompare(toDateOnly(a.end_date)))[0];
    if (previous) {
        return previous;
    }
    return series[0] ?? null;
}
