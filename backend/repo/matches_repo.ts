/* 
  Repo Functions' for Matches
  = GetAllMatches()
    - returns all matches in descending order
  = GetMatchById(id)
    - returns a match by id
  = GetMatchesByTeam(team)
    - returns all matches for a given team
  = GetMatchesByDate(date)
    - returns all matches for a given date
  = AddNewMatch(match)
    - adds a new match to the database
  = UpdateMatch(update)
    - updates a match in the database
  = DeleteMatches()
    - deletes all matches with editing_status = 'deleted'

*/

import { pool } from "../database/db";
import { Match } from "../../types/match_mod";
import { EMPTY_SLOT_SLUG_PREFIX } from "@/lib/teams/specialTeams";

let hasScoreWorkflowColumnsPromise: Promise<boolean> | null = null;

async function HasScoreWorkflowColumns(): Promise<boolean> {
  if (!hasScoreWorkflowColumnsPromise) {
    hasScoreWorkflowColumnsPromise = pool
      .query<{ exists: boolean }>(
        `SELECT EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_schema = 'public'
             AND table_name = 'matches'
             AND column_name = 'score_status'
         ) AS exists`
      )
      .then((result) => result.rows[0]?.exists ?? false);
  }

  return hasScoreWorkflowColumnsPromise;
}

function hydrateMatch(row: Partial<Match>): Match {
  return {
    id: row.id ?? "",
    date: row.date ?? "",
    time: row.time ?? "",
    home_team_id: row.home_team_id ?? "",
    away_team_id: row.away_team_id ?? "",
    field: row.field ?? "",
    division_id: row.division_id ?? "",
    home_score: row.home_score ?? null,
    away_score: row.away_score ?? null,
    score_status: row.score_status ?? "finalized",
    score_request_sent_at: row.score_request_sent_at ?? null,
    first_submitted_at: row.first_submitted_at ?? null,
    finalized_at: row.finalized_at ?? null,
    founder_notified_conflict_at: row.founder_notified_conflict_at ?? null,
    founder_notified_single_at: row.founder_notified_single_at ?? null,
    founder_notified_no_submission_at: row.founder_notified_no_submission_at ?? null,
    editing_status: row.editing_status ?? "draft",
  };
}

//==============================================================================
// Matches GET functions
//==============================================================================

export async function GetAllMatches(): Promise<Match[]> {
  const { rows } = await pool.query<Match>(
    `SELECT *
     FROM matches
     ORDER BY date DESC, time DESC`
  );
  return rows.map(hydrateMatch);
}
export async function GetAllSeasonMatches(
  seasonId: string,
  includeOpenSlotMatches = true
): Promise<Match[]> {
  const { rows } = await pool.query<Match>(
    `
    SELECT m.*
    FROM matches m
    JOIN divisions d ON d.id = m.division_id
    JOIN series s ON s.id = d.series_id
    JOIN teams ht ON ht.id = m.home_team_id
    JOIN teams at ON at.id = m.away_team_id
    WHERE s.season_id = $1
      AND m.editing_status <> 'deleted'
      ${includeOpenSlotMatches ? "" : `AND ht.slug NOT LIKE '${EMPTY_SLOT_SLUG_PREFIX}%'
      AND at.slug NOT LIKE '${EMPTY_SLOT_SLUG_PREFIX}%'`}
    ORDER BY m.date, m.time;
    `,
    [seasonId]
  );
  return rows.map(hydrateMatch);
}



export async function GetMatchById(id: string) {
  const {rows} = await pool.query (
    `SELECT * FROM matches WHERE id = $1`,
    [id]
  );
  return rows[0] ? hydrateMatch(rows[0]) : null;
}

export async function GetMatchesByTeam(teamId: string) {
  const {rows} = await pool.query(
    `SELECT *
     FROM matches
     WHERE home_team_id = $1 OR away_team_id = $1`,
    [teamId]
  );
  return rows.map(hydrateMatch);
}

export async function GetMatchesByDate(date: string) {
  const {rows} = await pool.query(
    `SELECT * FROM matches WHERE date = $1`,
    [date]
  );
  return rows.map(hydrateMatch);
}

export async function GetTeamsSeasonsMatches(
  team_id: string,
  season_id: string,
  includeOpenSlotMatches = true
): Promise<Match[]> {
  const { rows } = await pool.query<Match>(
    `
    SELECT m.*
    FROM matches m
    JOIN divisions d ON d.id = m.division_id
    JOIN series s ON s.id = d.series_id
    JOIN teams ht ON ht.id = m.home_team_id
    JOIN teams at ON at.id = m.away_team_id
    WHERE s.season_id = $1
      AND m.editing_status <> 'deleted'
      AND (m.home_team_id = $2 OR m.away_team_id = $2)
      ${includeOpenSlotMatches ? "" : `AND ht.slug NOT LIKE '${EMPTY_SLOT_SLUG_PREFIX}%'
      AND at.slug NOT LIKE '${EMPTY_SLOT_SLUG_PREFIX}%'`}
    ORDER BY m.date, m.time;
    `,
    [season_id, team_id]
  );

  return rows.map(hydrateMatch);
}
//==============================================================================
// Matches ADD functions
//==============================================================================

export async function AddNewMatch(match: Match) {
  const hasScoreWorkflowColumns = await HasScoreWorkflowColumns();
  const {rows} = hasScoreWorkflowColumns
    ? await pool.query(
        `INSERT INTO matches (
          date,
          time,
          home_team_id,
          away_team_id,
          field,
          division_id,
          home_score,
          away_score,
          score_status,
          score_request_sent_at,
          first_submitted_at,
          finalized_at,
          founder_notified_conflict_at,
          founder_notified_single_at,
          founder_notified_no_submission_at,
          editing_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          match.date,
          match.time,
          match.home_team_id,
          match.away_team_id,
          match.field,
          match.division_id,
          match.home_score,
          match.away_score,
          match.score_status,
          match.score_request_sent_at,
          match.first_submitted_at,
          match.finalized_at,
          match.founder_notified_conflict_at,
          match.founder_notified_single_at,
          match.founder_notified_no_submission_at,
          match.editing_status
        ]
      )
    : await pool.query(
        `INSERT INTO matches (
          date,
          time,
          home_team_id,
          away_team_id,
          field,
          division_id,
          home_score,
          away_score,
          editing_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          match.date,
          match.time,
          match.home_team_id,
          match.away_team_id,
          match.field,
          match.division_id,
          match.home_score,
          match.away_score,
          match.editing_status
        ]
      );
  if (rows.length === 0) {throw new Error(`Match not added: ${match.date} ${match.time}`);}
  return hydrateMatch(rows[0]);
}

//==============================================================================
// Matches UPDATE functions
//==============================================================================

export async function UpdateMatch(update: Match) {
  const hasScoreWorkflowColumns = await HasScoreWorkflowColumns();
  const {rows} = hasScoreWorkflowColumns
    ? await pool.query(
        `UPDATE matches
        SET 
          date = $2,
          time = $3,
          home_team_id =$4,
          away_team_id =  $5,
          field = $6,
          division_id = $7,
          home_score = $8,
          away_score = $9,
          score_status = $10,
          score_request_sent_at = $11,
          first_submitted_at = $12,
          finalized_at = $13,
          founder_notified_conflict_at = $14,
          founder_notified_single_at = $15,
          founder_notified_no_submission_at = $16,
          editing_status = $17
        WHERE id = $1
        RETURNING *
        `,
        [
          update.id,
          update.date,
          update.time,
          update.home_team_id,
          update.away_team_id,
          update.field,
          update.division_id,
          update.home_score,
          update.away_score,
          update.score_status,
          update.score_request_sent_at,
          update.first_submitted_at,
          update.finalized_at,
          update.founder_notified_conflict_at,
          update.founder_notified_single_at,
          update.founder_notified_no_submission_at,
          update.editing_status
        ]
      )
    : await pool.query(
        `UPDATE matches
        SET 
          date = $2,
          time = $3,
          home_team_id =$4,
          away_team_id =  $5,
          field = $6,
          division_id = $7,
          home_score = $8,
          away_score = $9,
          editing_status = $10
        WHERE id = $1
        RETURNING *
        `,
        [
          update.id,
          update.date,
          update.time,
          update.home_team_id,
          update.away_team_id,
          update.field,
          update.division_id,
          update.home_score,
          update.away_score,
          update.editing_status
        ]
      );
  if (rows.length === 0) {throw new Error(`Match not found: ${update.id}`);}
  return hydrateMatch(rows[0]);
}

//==============================================================================
// Matches DELETE functions
//==============================================================================

export async function DeleteMatches() {
  await pool.query(
    `DELETE FROM matches WHERE editing_status = 'deleted'`
  );
  return;
}

export async function MarkTeamMatchesDeleted(team_id: string) {
  const { rows } = await pool.query<Match>(
    `UPDATE matches
     SET editing_status = 'deleted'
     WHERE home_team_id = $1
        OR away_team_id = $1
     RETURNING *`,
    [team_id]
  );

  return rows.map(hydrateMatch);
}

export async function GetOfficialDivisionMatches(division_id: string): Promise<Match[]> {
  const hasScoreWorkflowColumns = await HasScoreWorkflowColumns();
  const { rows } = await pool.query<Match>(
    hasScoreWorkflowColumns
      ? `SELECT *
         FROM matches
         WHERE division_id = $1
           AND editing_status <> 'deleted'
           AND home_score IS NOT NULL
           AND away_score IS NOT NULL
           AND (
             score_status IN ('finalized', 'published_single_submission')
             OR score_status IS NULL
           )`
      : `SELECT *
         FROM matches
         WHERE division_id = $1
           AND editing_status <> 'deleted'
           AND home_score IS NOT NULL
           AND away_score IS NOT NULL`,
    [division_id]
  );

  return rows.map(hydrateMatch);
}
