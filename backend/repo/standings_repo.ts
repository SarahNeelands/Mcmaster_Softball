import {Standing} from "../../types/standing_mod";
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

export type StandingRow = {
  id: string,
  division_id: string,
  team_id: string,
  wins: number,
  losses: number,
  ties: number,
  points: number,
  series_id: string,
  editing_status: string
}




//==============================================================================
// Standings GET functions
//==============================================================================
export async function GetStandingsBySeries(series_id: string): Promise<StandingRow[]> {
  const {rows} = await pool.query<StandingRow>(
    `SELECT *
    FROM standings
    WHERE series_id = $1
      AND editing_status <> 'deleted'`,
    [series_id]
  );
  return rows;
}

export async function GetStandingsByDivision(division_id: string): Promise<StandingRow[]> {
  const {rows} = await pool.query<StandingRow>(
    `SELECT *
    FROM standings
    WHERE division_id = $1
      AND editing_status <> 'deleted'`,
    [division_id]
  );
  return rows;
}

export async function GetStandingsByTeam(team_id: string, series_id: string): Promise<StandingRow>  {
  const {rows} = await pool.query<StandingRow>(
    `SELECT *
    FROM standings
    WHERE team_id = $1 AND series_id = $2
      AND editing_status <> 'deleted'`,
    [team_id, series_id]
    );
  return rows[0];
}

//==============================================================================
// Standings ADD functions
//==============================================================================

export async function AddNewStandings(standing: Standing, division_id: string) {
  const {rows} = await pool.query(
    `INSERT INTO standings (division_id, team_id, wins, losses, ties, points, series_id, editing_status)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      division_id,
      standing.team.id,
      standing.wins,
      standing.losses,
      standing.ties,
      standing.points,
      standing.series_id,
      standing.editing_status
    ]
  );
  return rows[0];
}

export async function AddDivisionTeamStanding(
  division_id: string,
  series_id: string,
  team_id: string
) {
  const { rows } = await pool.query<StandingRow>(
    `INSERT INTO standings (division_id, team_id, wins, losses, ties, points, series_id, editing_status)
     VALUES($1,$2,0,0,0,0,$3,'draft')
     ON CONFLICT (division_id, team_id) DO NOTHING
     RETURNING *`,
    [division_id, team_id, series_id]
  );

  return rows[0] ?? null;
}

export async function MoveTeamStandingToDivision(
  team_id: string,
  series_id: string,
  division_id: string
) {
  const { rows } = await pool.query<StandingRow>(
    `UPDATE standings
     SET division_id = $3
     WHERE team_id = $1
       AND series_id = $2
     RETURNING *`,
    [team_id, series_id, division_id]
  );

  return rows[0] ?? null;
}

//==============================================================================
// Standings UPDATE functions
//==============================================================================

export async function UpdateStandings(update: Standing) {
  const {rows} = await pool.query(
    `UPDATE standings
    SET
      wins = $3,
      losses = $4,
      ties = $5,
      points = $6
    WHERE division_id = $1
      AND team_id = $2
    RETURNING *`,
    [
      update.division_id,
      update.team.id,
      update.wins,
      update.losses,
      update.ties,
      update.points]);
    if (rows.length === 0) {throw new Error(`Standings not found: ${update.team.id}`);}
    return rows;
}

//==============================================================================
// Standings DELETE functions
//==============================================================================

export async function DeleteStandings() {
  await pool.query(
    `DELETE FROM standings
    WHERE editing_status = 'deleted'
    RETURNING *`  
  );
  return;
}

export async function MarkTeamStandingsDeleted(team_id: string) {
  const { rows } = await pool.query<StandingRow>(
    `UPDATE standings
     SET editing_status = 'deleted'
     WHERE team_id = $1
     RETURNING *`,
    [team_id]
  );

  return rows;
}

export async function ResetDivisionStandings(division_id: string) {
  const { rows } = await pool.query<StandingRow>(
    `UPDATE standings
     SET wins = 0,
         losses = 0,
         ties = 0,
         points = 0
     WHERE division_id = $1
       AND editing_status <> 'deleted'
     RETURNING *`,
    [division_id]
  );

  return rows;
}
