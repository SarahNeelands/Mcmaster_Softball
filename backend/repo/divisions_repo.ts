
import { Division } from "../../types/division_mod";
import { pool } from "../database/db";
/* 
  Repo Functions' for Divisions
  = GetAllSeriesDivisions() 
    - returns all divisions in descending order
  = GetDivisionsById(id)
    - returns a division by id
  = AddNewDivisions(division)
    - adds a new division to the database
  = UpdateDivisionsById(division)
    - updates a division in the database
  = DeleteDivisions()
    - deletes all divisions with editing_status = 'deleted'
*/

export type DivisionRow = {
  id: string;
  name: string;
  series_id: string;
  win_points: number;
  loss_points: number;
  tie_points: number;
  editing_status: string;
};

let divisionStatusColumnPromise: Promise<"editing_status" | "edit_status"> | null = null;

async function GetDivisionStatusColumn(): Promise<"editing_status" | "edit_status"> {
  if (!divisionStatusColumnPromise) {
    divisionStatusColumnPromise = pool
      .query<{ exists: boolean }>(
        `SELECT EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_name = 'divisions'
             AND column_name = 'editing_status'
         ) AS exists`
      )
      .then((result) => (result.rows[0]?.exists ? "editing_status" : "edit_status"));
  }

  return divisionStatusColumnPromise;
}

//==============================================================================
// Divisions GET functions
//==============================================================================

export async function GetAllSeriesDivisions(series_id: string): Promise<DivisionRow[]>
{
  const statusColumn = await GetDivisionStatusColumn();
  const {rows} = await pool.query<DivisionRow>(
    `SELECT *,
      ${statusColumn} AS editing_status
    FROM divisions
    WHERE series_id = $1
      AND ${statusColumn} <> 'deleted'
    ORDER BY name ASC`,
    [series_id]);
  return rows;
}

export async function GetSeriesDivisionIds(series_id: string): Promise<string[]> {
  const statusColumn = await GetDivisionStatusColumn();
  const {rows} = await pool.query<{ id: string }>(
    `SELECT id
    FROM divisions
    WHERE series_id = $1
      AND ${statusColumn} <> 'deleted'
    ORDER BY name ASC`,
    [series_id]
  );
  return rows.map((row) => row.id);
}

export async function GetDivisionsById(division_id: string): Promise<DivisionRow[]>  {
  const statusColumn = await GetDivisionStatusColumn();
  const {rows} = await pool.query<DivisionRow>(
    `SELECT *,
      ${statusColumn} AS editing_status
    FROM divisions
    WHERE id = $1`,
    [division_id]);
  return rows;
}

export async function GetDivisionTeamIds(division_id: string): Promise<string[]> {
  const { rows } = await pool.query<{ team_id: string }>(
    `SELECT team_id
    FROM series_team_divisions
    WHERE division_id = $1`,
    [division_id]
  );

  return rows.map((row) => row.team_id);
}

//==============================================================================
// Divisions ADD functions
//==============================================================================


export async function AddNewDivisions(division: Division, series_id: string) {
  const statusColumn = await GetDivisionStatusColumn();
  const {rows} = await pool.query(
    `INSERT INTO divisions (name, series_id, win_points, loss_points, tie_points, ${statusColumn})
    VALUES($1,$2,$3,$4,$5,$6)
    RETURNING *, ${statusColumn} AS editing_status`,
    [division.name, 
      series_id, 
      division.win_points, 
      division.loss_points, 
      division.tie_points,
      division.editing_status
    ]
  );
  return rows[0];
}

export async function AddTeamToDivision(
  series_id: string,
  team_id: string,
  division_id: string
) {
  const { rows } = await pool.query(
    `INSERT INTO series_team_divisions (series_id, team_id, division_id)
     VALUES($1,$2,$3)
     ON CONFLICT (series_id, team_id) DO UPDATE
     SET division_id = EXCLUDED.division_id
     RETURNING *`,
    [series_id, team_id, division_id]
  );
  return rows[0];
}

export async function RemoveDivisionTeams(division_id: string) {
  await pool.query(
    `DELETE FROM series_team_divisions
     WHERE division_id = $1`,
    [division_id]
  );
}

//==============================================================================
// Divisions UPDATE functions
//==============================================================================

export async function UpdateDivisionsById(division: Division){
  const statusColumn = await GetDivisionStatusColumn();
  const {rows} = await pool.query(
    `UPDATE divisions
    SET
      name = $2,
      win_points = $3,
      loss_points = $4,
      tie_points = $5,
      ${statusColumn} = $6
    WHERE id = $1
    RETURNING *, ${statusColumn} AS editing_status`,
    [division.id, 
      division.name,
      division.win_points,
      division.loss_points, 
      division.tie_points, 
      division.editing_status
    ]);
  if (rows.length ===0){throw new Error(`Repo failed to update division ${division.id}`)}
  return rows;
}


//==============================================================================
// Divisions DELETE functions
//==============================================================================

export async function DeleteDivisions() {
  const statusColumn = await GetDivisionStatusColumn();
  await pool.query(
    `DELETE FROM divisions
    WHERE ${statusColumn} = 'deleted'
    RETURNING *`  
  );
  return;
}
