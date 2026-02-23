
import { Division } from "../models/division_mod";
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

//==============================================================================
// Divisions GET functions
//==============================================================================

export async function GetAllSeriesDivisions(series_id: string) 
{
  const {rows} = await pool.query(
    `SELECT *
    FROM divisions
    WHERE series_id = $1`,
    [series_id]);
  return rows;
}

export async function GetDivisionsById(division_id: string)  {
  const {rows} = await pool.query(
    `SELECT *
    FROM divisions
    WHERE id = $1`,
    [division_id]);
  return rows;
}

//==============================================================================
// Divisions ADD functions
//==============================================================================


export async function AddNewDivisions(division: Division, series_id: string) {
  const {rows} = await pool.query(
    `INSERT INTO series (name, series_id, win_points, loss_points, tie_points, editing_status)
    VALUES($1,$2,$3,$4,$5,$6)
    RETURNING *`,
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

//==============================================================================
// Divisions UPDATE functions
//==============================================================================

export async function UpdateDivisionsById(division: Division){
  const {rows} = await pool.query(
    `UPDATE divisions
    SET
      name = $2
      win_points = $3
      loss_points = $4
      tie_points = $5
      editing_status = $6
    WHERE id = $1
    RETURNING *`,
    [division.id, 
      division.name,
      division.win_points,
      division.loss_points, 
      division.tie_points, 
      division.editing_status
    ]);
  if (rows.length ===0){throw new Error(`Repo failed to update division ${division.id}`)}
  return;
}


//==============================================================================
// Divisions DELETE functions
//==============================================================================

export async function DeleteDivisions() {
  const {rows} = await pool.query(
    `DELETE FROM divisions
    WHERE editing_status = 'deleted'
    RETURNING *`  
  );
  return;
}