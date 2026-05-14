import { pool } from "../database/db";
import { Season} from "../../types/season_mod";

/* 
  Repo Functions' for Seasons
  = GetAllSeasons() 
    - returns all seasons in descending order
  = GetCurrentSeason()
    - returns the current season
  = AddNewSeason(season)
    - adds a new season to the database
  = UpdateSeasonById(season)
    - updates a season in the database
  = DeleteSeason()
    - deletes all seasons with editing_status = 'deleted'
*/

export type SeasonRow = {
  id: string;
  name: string;
  editing_status: string;
  admin_only?: boolean;
  score_notifications_enabled?: boolean;
  start_date: string;
  end_date: string;
};

let ensureSeasonColumnsPromise: Promise<void> | null = null;

async function EnsureSeasonColumns(): Promise<void> {
  if (!ensureSeasonColumnsPromise) {
    ensureSeasonColumnsPromise = (async () => {
      await pool.query(
        `ALTER TABLE seasons
         ADD COLUMN IF NOT EXISTS admin_only BOOLEAN NOT NULL DEFAULT FALSE,
         ADD COLUMN IF NOT EXISTS score_notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE`
      );
    })().catch((error) => {
      ensureSeasonColumnsPromise = null;
      throw error;
    });
  }

  await ensureSeasonColumnsPromise;
}

async function HasSeasonAdminOnlyColumn(): Promise<boolean> {
  await EnsureSeasonColumns();
  const result = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'seasons'
         AND column_name = 'admin_only'
     ) AS exists`
  );

  return result.rows[0]?.exists ?? false;
}

async function HasSeasonScoreNotificationsColumn(): Promise<boolean> {
  await EnsureSeasonColumns();
  const result = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'seasons'
         AND column_name = 'score_notifications_enabled'
     ) AS exists`
  );

  return result.rows[0]?.exists ?? false;
}

//==============================================================================
// Seasons GET functions
//==============================================================================

export async function GetAllSeasons():Promise<SeasonRow[]>{
  const hasAdminOnlyColumn = await HasSeasonAdminOnlyColumn();
  const hasScoreNotificationsColumn = await HasSeasonScoreNotificationsColumn();
  const {rows} = await pool.query<SeasonRow>(
    `SELECT *,
       ${hasAdminOnlyColumn ? "admin_only" : "FALSE AS admin_only"},
       ${hasScoreNotificationsColumn ? "score_notifications_enabled" : "FALSE AS score_notifications_enabled"}
     FROM seasons
     ORDER BY start_date DESC`
  );
    return rows;
}

export async function GetCurrentSeason():Promise<SeasonRow> {
  const hasAdminOnlyColumn = await HasSeasonAdminOnlyColumn();
  const hasScoreNotificationsColumn = await HasSeasonScoreNotificationsColumn();
  const { rows } = await pool.query<SeasonRow>(
    `SELECT *,
       ${hasAdminOnlyColumn ? "admin_only" : "FALSE AS admin_only"},
       ${hasScoreNotificationsColumn ? "score_notifications_enabled" : "FALSE AS score_notifications_enabled"}
     FROM seasons
     WHERE CURRENT_DATE BETWEEN start_date::date AND end_date::date
     ORDER BY start_date::date DESC
     LIMIT 1`
  );
  return rows[0] ?? null;
}

export async function GetPreviousSeason(): Promise<SeasonRow> {
  const hasAdminOnlyColumn = await HasSeasonAdminOnlyColumn();
  const hasScoreNotificationsColumn = await HasSeasonScoreNotificationsColumn();
  const { rows } = await pool.query<SeasonRow>(
    `SELECT *,
       ${hasAdminOnlyColumn ? "admin_only" : "FALSE AS admin_only"},
       ${hasScoreNotificationsColumn ? "score_notifications_enabled" : "FALSE AS score_notifications_enabled"}
     FROM seasons
     WHERE end_date::date < CURRENT_DATE
     ORDER BY end_date::date DESC
     LIMIT 1`
  );
  return rows[0] ?? null;
}

export async function GetSeasonById(id: string):Promise<SeasonRow[]> {
  const hasAdminOnlyColumn = await HasSeasonAdminOnlyColumn();
  const hasScoreNotificationsColumn = await HasSeasonScoreNotificationsColumn();
  const { rows } = await pool.query<SeasonRow>(
    `SELECT *,
       ${hasAdminOnlyColumn ? "admin_only" : "FALSE AS admin_only"},
       ${hasScoreNotificationsColumn ? "score_notifications_enabled" : "FALSE AS score_notifications_enabled"}
     FROM seasons
     WHERE id = $1`,
    [id]
  );
  return rows;
}


//==============================================================================
// Seasons UPDATE functions
//==============================================================================

export async function UpdateSeason(season: Season): Promise<SeasonRow[]> {
  console.log("repo UpdateSeason received:", season);
  const hasAdminOnlyColumn = await HasSeasonAdminOnlyColumn();
  const hasScoreNotificationsColumn = await HasSeasonScoreNotificationsColumn();

  const {rows} = hasAdminOnlyColumn || hasScoreNotificationsColumn
    ? await pool.query<SeasonRow>(
        `UPDATE seasons
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
           ${hasScoreNotificationsColumn ? "score_notifications_enabled" : "FALSE AS score_notifications_enabled"}`,
        [
          season.name,
          season.start_date,
          season.end_date,
          season.editing_status,
          ...(hasAdminOnlyColumn ? [season.admin_only ?? false] : []),
          ...(hasScoreNotificationsColumn ? [season.score_notifications_enabled ?? false] : []),
          season.id,
        ]
      )
    : await pool.query<SeasonRow>(
        `UPDATE seasons
         SET
           name =$1,
           start_date = $2,
           end_date =$3,
           editing_status =$4
         WHERE id = $5
         RETURNING *, FALSE AS admin_only, FALSE AS score_notifications_enabled`,
        [season.name, season.start_date, season.end_date, season.editing_status, season.id]
      );
  if (rows.length ===0){throw new Error (`repo failed to update ${season.id}`);}
  return rows;
}

//==============================================================================
// Seasons CREATE functions
//==============================================================================

export async function AddNewSeason(season: Season)
{
  const hasAdminOnlyColumn = await HasSeasonAdminOnlyColumn();
  const hasScoreNotificationsColumn = await HasSeasonScoreNotificationsColumn();
  const {rows}= hasAdminOnlyColumn || hasScoreNotificationsColumn
    ? await pool.query(
        `INSERT INTO seasons (
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
           ${hasScoreNotificationsColumn ? "score_notifications_enabled" : "FALSE AS score_notifications_enabled"}`,
        [
          season.name,
          season.start_date,
          season.end_date,
          season.editing_status,
          ...(hasAdminOnlyColumn ? [season.admin_only ?? false] : []),
          ...(hasScoreNotificationsColumn ? [season.score_notifications_enabled ?? false] : []),
        ]
      )
    : await pool.query(
        `INSERT INTO seasons (name, start_date, end_date, editing_status)
         VALUES($1, $2, $3, $4)
         RETURNING *, FALSE AS admin_only, FALSE AS score_notifications_enabled`,
        [season.name, season.start_date, season.end_date, season.editing_status]
      );
  return rows[0];
}

export async function AddNewSeasonTeams(team_id: string, season_id: string): Promise<string[]>
{
  const {rows}= await pool.query(
    `INSERT INTO season_teams (season_id, team_id)
    VALUES($1, $2)
    RETURNING *`,
    [season_id, team_id]
  );
  return rows;
}

//==============================================================================
// Seasons DELETE functions
//==============================================================================

export async function DeleteSeason() {
  await pool.query(
    `DELETE FROM seasons
    WHERE editing_status = 'deleted'
    RETURNING *`  
  );
  return;
}
