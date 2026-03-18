
import { Series} from "@/types/series_mod";
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
export type SeriesRow = {
  id: string,
  name: string,
  season_id: string,
  start_date: string,
  end_date: string,
  advance_amount: number,
  demote_amount: number,
  editing_status: string
}

let hasSeriesEditingStatusColumnPromise: Promise<boolean> | null = null;

async function HasSeriesEditingStatusColumn(): Promise<boolean> {
  if (!hasSeriesEditingStatusColumnPromise) {
    hasSeriesEditingStatusColumnPromise = pool
      .query<{ exists: boolean }>(
        `SELECT EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_name = 'series'
             AND column_name = 'editing_status'
         ) AS exists`
      )
      .then((result) => result.rows[0]?.exists ?? false)
      .catch(() => false);
  }

  return hasSeriesEditingStatusColumnPromise;
}

export async function GetAllSeasonsSeries(season_id: string): Promise<SeriesRow[]>
{
  const {rows} = await pool.query<SeriesRow>(
    `SELECT *
    FROM series
    WHERE season_id = $1
    ORDER BY start_date DESC`,
    [season_id]);
  return rows;
}

export async function GetCurrentSeries(season_id: string): Promise<SeriesRow | null> {
  const { rows } = await pool.query<SeriesRow>(
    `SELECT *
     FROM series
     WHERE (CURRENT_DATE BETWEEN start_date::date AND end_date::date) AND season_id = $1
     ORDER BY start_date::date DESC
     LIMIT 1`,
    [season_id]
  );
  return rows[0] ?? null;
}

export async function GetPreviousSeries(season_id: string): Promise<SeriesRow | null> {
  const { rows } = await pool.query<SeriesRow>(
    `SELECT *
     FROM series
     WHERE season_id = $1
       AND end_date::date < CURRENT_DATE
     ORDER BY end_date::date DESC
     LIMIT 1`,
    [season_id]
  );
  return rows[0] ?? null;
}

export async function GetSeasonSeriesIds(season_id: string): Promise<string[]>
{
  const {rows} = await pool.query<{ id: string }>(
    `SELECT id
    FROM series
    WHERE season_id = $1
    ORDER BY start_date DESC`,
    [season_id]
  );
  return rows.map((row) => row.id);
}

export async function GetSeriesById(series_id: string): Promise<SeriesRow>
{
  const {rows} = await pool.query<SeriesRow>(
    `SELECT *
    FROM series
    WHERE id = $1`,
    [series_id]);
  return rows[0];
}

//==============================================================================
// Series ADD functions
//==============================================================================


export async function AddNewSeries(series: Series, season_id: string): Promise<SeriesRow>
{
  const hasEditingStatus = await HasSeriesEditingStatusColumn();
  const {rows} = hasEditingStatus
    ? await pool.query<SeriesRow>(
        `INSERT INTO series (name, season_id, start_date, end_date, advance_amount, demote_amount, editing_status)
        VALUES($1,$2,$3,$4,$5,$6,$7)
        RETURNING *`,
        [
          series.name,
          season_id,
          series.start_date,
          series.end_date,
          series.advance_amount,
          series.demote_amount,
          series.editing_status,
        ]
      )
    : await pool.query<SeriesRow>(
        `INSERT INTO series (name, season_id, start_date, end_date, advance_amount, demote_amount)
        VALUES($1,$2,$3,$4,$5,$6)
        RETURNING *`,
        [
          series.name,
          season_id,
          series.start_date,
          series.end_date,
          series.advance_amount,
          series.demote_amount,
        ]
      );
  return rows[0];
}

//==============================================================================
// Series UPDATE functions
//==============================================================================

export async function UpdateSeriesById(series: Series): Promise<SeriesRow>{
  const hasEditingStatus = await HasSeriesEditingStatusColumn();
  const {rows} = hasEditingStatus
    ? await pool.query<SeriesRow>(
        `UPDATE series
        SET
          name = $2,
          start_date = $3,
          end_date = $4,
          advance_amount = $5,
          demote_amount = $6,
          editing_status = $7
        WHERE id = $1
        RETURNING *`,
        [
          series.id,
          series.name,
          series.start_date,
          series.end_date,
          series.advance_amount,
          series.demote_amount,
          series.editing_status,
        ]
      )
    : await pool.query<SeriesRow>(
        `UPDATE series
        SET
          name = $2,
          start_date = $3,
          end_date = $4,
          advance_amount = $5,
          demote_amount = $6
        WHERE id = $1
        RETURNING *`,
        [
          series.id,
          series.name,
          series.start_date,
          series.end_date,
          series.advance_amount,
          series.demote_amount,
        ]
      );
  if (rows.length ===0){throw new Error(`Repo failed to update series ${series.id}`)}
  return rows[0];
}

//==============================================================================
// Series DELETE functions
//==============================================================================

export async function DeleteSeries() {
  const hasEditingStatus = await HasSeriesEditingStatusColumn();
  if (!hasEditingStatus) {
    return;
  }

  await pool.query(
    `DELETE FROM series
    WHERE editing_status = 'deleted'
    RETURNING *`
  );
  return;
}
