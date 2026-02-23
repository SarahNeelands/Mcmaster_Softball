
/*
  Repo Functions' for Announcements
  = GetActiveAnnouncements(season_id)
    - returns all active announcements in descending order for a given season
  = GetArchivedAnnouncements(season_id)
    - returns all archived announcements in descending order for a given season
  = AddNewAnnouncement(announcement)
    - adds a new announcement to the database

  = UpdateAnnouncement(update)
    - updates an announcement in the database

*/
import { pool } from "../database/db";
import { Announcement } from "../models/announcement_mod";
//==============================================================================
// Announcements GET functions
//==============================================================================
export async function getActiveAnnouncements(seasonId: string) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM announcements
    WHERE archived = false
      AND season_id = $1
    ORDER BY date DESC
    `,
    [seasonId]
  );

  return rows;
}
export async function getArchivedAnnouncements(seasonId: string) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM announcements
    WHERE archived = true
      AND season_id = $1
    ORDER BY date DESC
    `,
    [seasonId]
  );

  return rows;
}

//==============================================================================
// Announcements ADD functions
//==============================================================================
export async function AddNewAnnouncement(announcement: Announcement) {
  const {rows} = await pool.query(
    `INSERT INTO announcements (title, content, date, archived, season_id)
    VALUES ($1, $2, $3, $4, $5)`,
    [
      announcement.title,
      announcement.content,
      announcement.date,
      announcement.archived,
      announcement.season_id
    ]
  );
  return;
}

//==============================================================================
// Announcements UPDATE functions
//==============================================================================

export async function UpdateAnnouncement(update: Announcement) 
{
  const {rows} = await pool.query(
    `UPDATE announcements
    SET
      title = $1,
      content = $2,
      date = $3,
      archived = $4,
      season_id = $5
    WHERE id = $6
    RETURNING *
    `,
    [
      update.title,
      update.content,
      update.date,
      update.archived,
      update.season_id,
      update.id
    ]
    );
    if (rows.length === 0) {throw new Error(`Announcement not found: ${update.id}`);}
    return;
}
