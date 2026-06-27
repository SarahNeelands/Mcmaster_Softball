"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllSeasons = GetAllSeasons;
exports.GetCurrentSeason = GetCurrentSeason;
exports.GetPreviousSeason = GetPreviousSeason;
exports.GetSeasonById = GetSeasonById;
exports.UpdateSeason = UpdateSeason;
exports.AddNewSeason = AddNewSeason;
exports.AddNewSeasonTeams = AddNewSeasonTeams;
exports.DeleteSeason = DeleteSeason;
const db_1 = require("../database/db");
let ensureSeasonColumnsPromise = null;
async function EnsureSeasonColumns() {
    if (!ensureSeasonColumnsPromise) {
        ensureSeasonColumnsPromise = Promise.resolve();
    }
    return ensureSeasonColumnsPromise;
}
async function HasSeasonAdminOnlyColumn() {
    await EnsureSeasonColumns();
    const result = await db_1.pool.query(`SELECT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'seasons'
         AND column_name = 'admin_only'
     ) AS exists`);
    return result.rows[0]?.exists ?? false;
}
async function HasSeasonScoreNotificationsColumn() {
    await EnsureSeasonColumns();
    const result = await db_1.pool.query(`SELECT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'seasons'
         AND column_name = 'score_notifications_enabled'
     ) AS exists`);
    return result.rows[0]?.exists ?? false;
}
//==============================================================================
// Seasons GET functions
//==============================================================================
async function GetAllSeasons() {
    const hasAdminOnlyColumn = await HasSeasonAdminOnlyColumn();
    const hasScoreNotificationsColumn = await HasSeasonScoreNotificationsColumn();
    const { rows } = await db_1.pool.query(`SELECT *,
       ${hasAdminOnlyColumn ? "admin_only" : "FALSE AS admin_only"},
       ${hasScoreNotificationsColumn ? "score_notifications_enabled" : "FALSE AS score_notifications_enabled"}
     FROM seasons
     ORDER BY start_date DESC`);
    return rows;
}
async function GetCurrentSeason() {
    const hasAdminOnlyColumn = await HasSeasonAdminOnlyColumn();
    const hasScoreNotificationsColumn = await HasSeasonScoreNotificationsColumn();
    const { rows } = await db_1.pool.query(`SELECT *,
       ${hasAdminOnlyColumn ? "admin_only" : "FALSE AS admin_only"},
       ${hasScoreNotificationsColumn ? "score_notifications_enabled" : "FALSE AS score_notifications_enabled"}
     FROM seasons
     WHERE CURRENT_DATE BETWEEN start_date::date AND end_date::date
     ORDER BY start_date::date DESC
     LIMIT 1`);
    return rows[0] ?? null;
}
async function GetPreviousSeason() {
    const hasAdminOnlyColumn = await HasSeasonAdminOnlyColumn();
    const hasScoreNotificationsColumn = await HasSeasonScoreNotificationsColumn();
    const { rows } = await db_1.pool.query(`SELECT *,
       ${hasAdminOnlyColumn ? "admin_only" : "FALSE AS admin_only"},
       ${hasScoreNotificationsColumn ? "score_notifications_enabled" : "FALSE AS score_notifications_enabled"}
     FROM seasons
     WHERE end_date::date < CURRENT_DATE
     ORDER BY end_date::date DESC
     LIMIT 1`);
    return rows[0] ?? null;
}
async function GetSeasonById(id) {
    const hasAdminOnlyColumn = await HasSeasonAdminOnlyColumn();
    const hasScoreNotificationsColumn = await HasSeasonScoreNotificationsColumn();
    const { rows } = await db_1.pool.query(`SELECT *,
       ${hasAdminOnlyColumn ? "admin_only" : "FALSE AS admin_only"},
       ${hasScoreNotificationsColumn ? "score_notifications_enabled" : "FALSE AS score_notifications_enabled"}
     FROM seasons
     WHERE id = $1`, [id]);
    return rows;
}
//==============================================================================
// Seasons UPDATE functions
//==============================================================================
async function UpdateSeason(season) {
    console.log("repo UpdateSeason received:", season);
    const hasAdminOnlyColumn = await HasSeasonAdminOnlyColumn();
    const hasScoreNotificationsColumn = await HasSeasonScoreNotificationsColumn();
    const { rows } = hasAdminOnlyColumn || hasScoreNotificationsColumn
        ? await db_1.pool.query(`UPDATE seasons
         SET
           name =$1,
           start_date = $2,
           end_date =$3,
           editing_status =$4
           ${hasAdminOnlyColumn ? ", admin_only = $5" : ""}
           ${hasScoreNotificationsColumn ? `, score_notifications_enabled = $${hasAdminOnlyColumn ? 6 : 5}` : ""}
         WHERE id = $${hasAdminOnlyColumn || hasScoreNotificationsColumn ? (hasAdminOnlyColumn && hasScoreNotificationsColumn ? 7 : 6) : 5}
         RETURNING *,
           ${hasAdminOnlyColumn ? "admin_only" : "FALSE AS admin_only"},
           ${hasScoreNotificationsColumn ? "score_notifications_enabled" : "FALSE AS score_notifications_enabled"}`, [
            season.name,
            season.start_date,
            season.end_date,
            season.editing_status,
            ...(hasAdminOnlyColumn ? [season.admin_only ?? false] : []),
            ...(hasScoreNotificationsColumn ? [season.score_notifications_enabled ?? false] : []),
            season.id,
        ])
        : await db_1.pool.query(`UPDATE seasons
         SET
           name =$1,
           start_date = $2,
           end_date =$3,
           editing_status =$4
         WHERE id = $5
         RETURNING *, FALSE AS admin_only, FALSE AS score_notifications_enabled`, [season.name, season.start_date, season.end_date, season.editing_status, season.id]);
    if (rows.length === 0) {
        throw new Error(`repo failed to update ${season.id}`);
    }
    return rows;
}
//==============================================================================
// Seasons CREATE functions
//==============================================================================
async function AddNewSeason(season) {
    const hasAdminOnlyColumn = await HasSeasonAdminOnlyColumn();
    const hasScoreNotificationsColumn = await HasSeasonScoreNotificationsColumn();
    const { rows } = hasAdminOnlyColumn || hasScoreNotificationsColumn
        ? await db_1.pool.query(`INSERT INTO seasons (
           name,
           start_date,
           end_date,
           editing_status
           ${hasAdminOnlyColumn ? ", admin_only" : ""}
           ${hasScoreNotificationsColumn ? ", score_notifications_enabled" : ""}
         )
         VALUES(
           $1, $2, $3, $4
           ${hasAdminOnlyColumn ? ", $5" : ""}
           ${hasScoreNotificationsColumn ? `, $${hasAdminOnlyColumn ? 6 : 5}` : ""}
         )
         RETURNING *,
           ${hasAdminOnlyColumn ? "admin_only" : "FALSE AS admin_only"},
           ${hasScoreNotificationsColumn ? "score_notifications_enabled" : "FALSE AS score_notifications_enabled"}`, [
            season.name,
            season.start_date,
            season.end_date,
            season.editing_status,
            ...(hasAdminOnlyColumn ? [season.admin_only ?? false] : []),
            ...(hasScoreNotificationsColumn ? [season.score_notifications_enabled ?? false] : []),
        ])
        : await db_1.pool.query(`INSERT INTO seasons (name, start_date, end_date, editing_status)
         VALUES($1, $2, $3, $4)
         RETURNING *, FALSE AS admin_only, FALSE AS score_notifications_enabled`, [season.name, season.start_date, season.end_date, season.editing_status]);
    return rows[0];
}
async function AddNewSeasonTeams(team_id, season_id) {
    const { rows } = await db_1.pool.query(`INSERT INTO season_teams (season_id, team_id)
    VALUES($1, $2)
    RETURNING *`, [season_id, team_id]);
    return rows;
}
//==============================================================================
// Seasons DELETE functions
//==============================================================================
async function DeleteSeason() {
    await db_1.pool.query(`DELETE FROM seasons
    WHERE editing_status = 'deleted'
    RETURNING *`);
    return;
}
