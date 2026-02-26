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

export type SeasonRow = {
  id: string;
  name: string;
  editing_status: string;
  start_date: string;
  end_date: string;
};

//==============================================================================
// Seasons GET functions
//==============================================================================

export async function GetAllSeasons():Promise<SeasonRow[]>{
  const {rows} = await pool.query<SeasonRow>(
    `SELECT * 
    FROM seasons
    ORDER BY start_date DESC`);
    return rows;
}

export async function GetCurrentSeason():Promise<SeasonRow> {
  const { rows } = await pool.query<SeasonRow>(
    `SELECT *
     FROM seasons
     WHERE CURRENT_DATE BETWEEN start_date::date AND end_date::date
     ORDER BY start_date::date DESC
     LIMIT 1`
  );
  return rows[0] ?? null;
}


//==============================================================================
// Seasons UPDATE functions
//==============================================================================

export async function UpdateSeason(season: Season): Promise<SeasonRow> {
  const {rows} = await pool.query<SeasonRow>(
    `UPDATE seasons
    SET
      name =$1
      start_date = $2
      end_date =$3
    WHERE id = $4
    RETURNING *`,
  [season.name, season.start_date, season.end_date, season.id]);
  if (rows.length ===0){throw new Error (`repo failed to update ${season.id}`);}
  return rows;
}

//==============================================================================
// Seasons CREATE functions
//==============================================================================

export async function AddNewSeason(season: Season)
{
  const {rows}= await pool.query(
    `INSERT INTO seasons (name, start_date, end_date)
    VALUES($1, $2, $3)
    RETURNING *`,
    [season.name, season.start_date, season.end_date]
  );
  return rows[0];
}

export async function AddNewSeasonTeams(team_id: string, season_id: string): Promise<string[]>
{
  const {rows}= await pool.query<string>(
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
  const {rows} = await pool.query(
    `DELETE FROM seasons
    WHERE editing_status = 'deleted'
    RETURNING *`  
  );
  return;
}