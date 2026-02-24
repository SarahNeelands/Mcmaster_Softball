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
import { Match } from "../models/match_mod";

//==============================================================================
// Matches GET functions
//==============================================================================

export async function GetAllMatches(): Promise<Match[]> {
  const { rows } = await pool.query<Match>(
    `SELECT *
     FROM matches
     ORDER BY date DESC, time DESC`
  );
  return rows;
}
export async function GetMatchById(id: string) {
  const {rows} = await pool.query (
    `SELECT * FROM matches WHERE id = id`
  );
  return rows;
}

export async function GetMatchesByTeam(team: string) {
  const {rows} = await pool.query(
    `SELECT * FROM matches WHERE home_team = $1 OR away_team = $1`,
    [team]
  );
  return rows;
}

export async function GetMatchesByDate(date: string) {
  const {rows} = await pool.query(
    `SELECT * FROM matches WHERE date = $1`,
    [date]
  );
  return rows;
}


//==============================================================================
// Matches ADD functions
//==============================================================================

export async function AddNewMatch(match: Match) {
  const {rows} = await pool.query(
    `INSERT INTO matches (date, time, home_team_id, away_team_id, field, division_id, home_score, away_score, editing_status)
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
    ]);
  if (rows.length === 0) {throw new Error(`Match not added: ${match.date} ${match.time}`);}
  return;
}

//==============================================================================
// Matches UPDATE functions
//==============================================================================

export async function UpdateMatch(update: Match) {
  const {rows} = await pool.query(
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
  return;
}

//==============================================================================
// Matches DELETE functions
//==============================================================================

export async function DeleteMatches() {
  const {rows} = await pool.query(
    `DELETE FROM matches WHERE editing_status = 'deleted'`
  );
  return;
}