import { pool } from "../database/db";
import { Season} from "../models/season_mod";

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

//==============================================================================
// Seasons GET functions
//==============================================================================

export async function GetAllSeasons(){
  const {rows} = await pool.query(
    `SELECT * 
    FROM seasons`);
    return rows;
}

export async function GetCurrentSeason() {
  const {rows} = await pool.query(
    `SELECT * 
    FROM seasons
    WHERE is_active = true
    LIMIT 1`);
  return rows;
}

//==============================================================================
// Seasons UPDATE functions
//==============================================================================

export async function UpdateSeasonById(season: Season) {
  const {rows} = await pool.query(
    `UPDATE seasons
    SET
      name =$1
      is_active = $2
    WHERE id = $3
    RETURNING *`,
  [season.name, season.is_active, season.id]);
  if (rows.length ===0){throw new Error (`repo failed to update ${season.id}`);}
  return;
}

//==============================================================================
// Seasons CREATE functions
//==============================================================================

export async function AddNewSeason(season: Season)
{
  const {rows}= await pool.query(
    `INSERT INTO seasons (name, is_active)
    VALUES($1, $2)
    RETURNING *`,
    [season.name, season.is_active]
  );
  return rows[0];
}

//==============================================================================
// Seasons DELETE functions
//==============================================================================

export async function DeleteSeason() {
  const {rows} = await pool.query(
    `DELETE FROM seasons
    WHERE editing_status = 'deleted'
    RETURNING *`  
  );
  return;
}