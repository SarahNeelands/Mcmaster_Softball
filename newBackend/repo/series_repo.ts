
import { Series} from "../models/series_mod";
import { pool } from "../database/db";
/* 
  Repo Functions' for Series
  = GetAllSeries()    
    - returns all series in descending order
  = GetSeriesById(id)
    - returns a series by id
  = AddNewSeries(series)
    - adds a new series to the database
  = UpdateSeriesById(series)
    - updates a series in the database
  = DeleteSeries()
    - deletes all series with editing_status = 'deleted'
*/

//==============================================================================
// Series GET functions
//==============================================================================

export async function GetAllSeasonsSeries(season_id: string) 
{
  const {rows} = await pool.query(
    `SELECT *
    FROM series
    WHERE season_id = $1`,
    [season_id]);
  return rows;
}

export async function GetSeriesById(series_id: string)  {
  const {rows} = await pool.query(
    `SELECT *
    FROM series
    WHERE id = $1`,
    [series_id]);
  return rows;
}

export async function GetCurrentSeries() {
  const {rows} = await pool.query(
    `SELECT *
    FROM series
    WHERE is_active = true`);
  return rows;
}
//==============================================================================
// Series ADD functions
//==============================================================================


export async function AddNewSeries(series: Series, season_id: string) {
  const {rows} = await pool.query(
    `INSERT INTO series (name, season_id, start_date, end_date, advance_amount, demote_amount)
    VALUES($1,$2,$3,$4,$5,$6)
    RETURNING *`,
    [series.name, 
      season_id, 
      series.start_date, 
      series.end_date, 
      series.advance_amount, 
      series.demote_amount]
  );
  return rows[0];
}

//==============================================================================
// Series UPDATE functions
//==============================================================================

export async function UpdateSeriesById(series: Series){
  const {rows} = await pool.query(
    `UPDATE series
    SET
      name = $2
      start_date = $3
      end_date = $4
      advance_amount = $5
      demote_amount = $6
      is_active = $7
      editing_status = $8
    WHERE id = $1
    RETURNING *`,
    [series.id, 
      series.name,
      series.start_date,
      series.end_date, 
      series.advance_amount, 
      series.demote_amount, 
      series.is_active,
    series.editing_status]);
  if (rows.length ===0){throw new Error(`Repo failed to update series ${series.id}`)}
  return;
}

//==============================================================================
// Series DELETE functions
//==============================================================================

export async function DeleteSeries() {
  const {rows} = await pool.query(
    `DELETE FROM series
    WHERE editing_status = 'deleted'
    RETURNING *`  
  );
  return;
}