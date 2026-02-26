import {Standing} from "../models/standing_mod";
import { pool } from "../database/db";
/* 
  Repo Functions' for Standings
  = GetStandingsByDivision(division_id)
    - returns all standings for a given division
  = GetStandingsByTeam(team_id)
    - returns all standings for a given team
  = AddNewStandings(standing)
    - adds a new standing to the database
  = UpdateStandings(update)
    - updates a standing in the database
  = DeleteStandings()
    - deletes all standings with editing_status = 'deleted'
*/

//==============================================================================
// Standings GET functions
//==============================================================================
export async function GetStandingsByDivision(division_id: string) {
  const {rows} = await pool.query(
    `SELECT *
    FROM standings
    WHERE division_id = $1`,
    [division_id]
  );
  return rows;
}

export async function GetStandingsByTeam(team_id: string) {
  const {rows} = await pool.query(
    `SELECT *
    FROM standings
    WHERE team_id = $1`,
    [team_id]
    );
  return rows;
}

//==============================================================================
// Standings ADD functions
//==============================================================================

export async function AddNewStandings(standing: Standing, division_id: string) {
  const {rows} = await pool.query(
    `INSERT INTO standings (division_id, team_id, wins, losses, ties, points)
    VALUES($1,$2,$3,$4,$5,$6)
    RETURNING *`,
    [
      division_id,
      standing.team_id,
      standing.wins,
      standing.losses,
      standing.ties,
      standing.points
    ]
  );
  return rows[0];
}

//==============================================================================
// Standings UPDATE functions
//==============================================================================

export async function UpdateStandings(update: Standing) {
  const {rows} = await pool.query(
    `UPDATE standings
    SET
      wins = $2,
      losses = $3,
      ties = $4,
      points = $5
    WHERE team_id = $1
    RETURNING *`,
    [
      update.team_id,
      update.wins,
      update.losses,
      update.ties,
      update.points]);
    if (rows.length === 0) {throw new Error(`Standings not found: ${update.team_id}`);}
    return rows;
}

//==============================================================================
// Standings DELETE functions
//==============================================================================

export async function DeleteStandings() {
  const {rows} = await pool.query(
    `DELETE FROM standings
    WHERE editing_status = 'deleted'
    RETURNING *`  
  );
  return;
}