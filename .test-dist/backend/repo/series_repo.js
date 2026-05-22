"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllSeasonsSeries = GetAllSeasonsSeries;
exports.GetCurrentSeries = GetCurrentSeries;
exports.GetPreviousSeries = GetPreviousSeries;
exports.GetSeasonSeriesIds = GetSeasonSeriesIds;
exports.GetSeriesById = GetSeriesById;
exports.AddNewSeries = AddNewSeries;
exports.UpdateSeriesById = UpdateSeriesById;
exports.DeleteSeries = DeleteSeries;
const db_1 = require("../database/db");
let hasSeriesEditingStatusColumnPromise = null;
async function HasSeriesEditingStatusColumn() {
    if (!hasSeriesEditingStatusColumnPromise) {
        hasSeriesEditingStatusColumnPromise = db_1.pool
            .query(`SELECT EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_name = 'series'
             AND column_name = 'editing_status'
         ) AS exists`)
            .then((result) => result.rows[0]?.exists ?? false)
            .catch(() => false);
    }
    return hasSeriesEditingStatusColumnPromise;
}
async function GetAllSeasonsSeries(season_id) {
    const { rows } = await db_1.pool.query(`SELECT *
    FROM series
    WHERE season_id = $1
    ORDER BY start_date DESC`, [season_id]);
    return rows;
}
async function GetCurrentSeries(season_id) {
    const { rows } = await db_1.pool.query(`SELECT *
     FROM series
     WHERE (CURRENT_DATE BETWEEN start_date::date AND end_date::date) AND season_id = $1
     ORDER BY start_date::date DESC
     LIMIT 1`, [season_id]);
    return rows[0] ?? null;
}
async function GetPreviousSeries(season_id) {
    const { rows } = await db_1.pool.query(`SELECT *
     FROM series
     WHERE season_id = $1
       AND end_date::date < CURRENT_DATE
     ORDER BY end_date::date DESC
     LIMIT 1`, [season_id]);
    return rows[0] ?? null;
}
async function GetSeasonSeriesIds(season_id) {
    const { rows } = await db_1.pool.query(`SELECT id
    FROM series
    WHERE season_id = $1
    ORDER BY start_date DESC`, [season_id]);
    return rows.map((row) => row.id);
}
async function GetSeriesById(series_id) {
    const { rows } = await db_1.pool.query(`SELECT *
    FROM series
    WHERE id = $1`, [series_id]);
    return rows[0];
}
//==============================================================================
// Series ADD functions
//==============================================================================
async function AddNewSeries(series, season_id) {
    const hasEditingStatus = await HasSeriesEditingStatusColumn();
    const { rows } = hasEditingStatus
        ? await db_1.pool.query(`INSERT INTO series (name, season_id, start_date, end_date, advance_amount, demote_amount, editing_status)
        VALUES($1,$2,$3,$4,$5,$6,$7)
        RETURNING *`, [
            series.name,
            season_id,
            series.start_date,
            series.end_date,
            series.advance_amount,
            series.demote_amount,
            series.editing_status,
        ])
        : await db_1.pool.query(`INSERT INTO series (name, season_id, start_date, end_date, advance_amount, demote_amount)
        VALUES($1,$2,$3,$4,$5,$6)
        RETURNING *`, [
            series.name,
            season_id,
            series.start_date,
            series.end_date,
            series.advance_amount,
            series.demote_amount,
        ]);
    return rows[0];
}
//==============================================================================
// Series UPDATE functions
//==============================================================================
async function UpdateSeriesById(series) {
    const hasEditingStatus = await HasSeriesEditingStatusColumn();
    const { rows } = hasEditingStatus
        ? await db_1.pool.query(`UPDATE series
        SET
          name = $2,
          start_date = $3,
          end_date = $4,
          advance_amount = $5,
          demote_amount = $6,
          editing_status = $7
        WHERE id = $1
        RETURNING *`, [
            series.id,
            series.name,
            series.start_date,
            series.end_date,
            series.advance_amount,
            series.demote_amount,
            series.editing_status,
        ])
        : await db_1.pool.query(`UPDATE series
        SET
          name = $2,
          start_date = $3,
          end_date = $4,
          advance_amount = $5,
          demote_amount = $6
        WHERE id = $1
        RETURNING *`, [
            series.id,
            series.name,
            series.start_date,
            series.end_date,
            series.advance_amount,
            series.demote_amount,
        ]);
    if (rows.length === 0) {
        throw new Error(`Repo failed to update series ${series.id}`);
    }
    return rows[0];
}
//==============================================================================
// Series DELETE functions
//==============================================================================
async function DeleteSeries() {
    const hasEditingStatus = await HasSeriesEditingStatusColumn();
    if (!hasEditingStatus) {
        return;
    }
    await db_1.pool.query(`DELETE FROM series
    WHERE editing_status = 'deleted'
    RETURNING *`);
    return;
}
