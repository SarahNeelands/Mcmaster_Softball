
import {Team} from "../../types/team_mod"
import {pool} from "../database/db"
//==============================================================================
// Team GET functions
//==============================================================================

export async function GetAllTeamsOfSeason(season_id: string): Promise<string[]> {
  const { rows } = await pool.query<{ team_id: string }>(
    `SELECT team_id
     FROM season_teams
     WHERE season_id = $1`,
    [season_id]
  );

  return rows.map(r => r.team_id);
}

export async function GetTeamById(team_id: string): Promise<Team> {
  const { rows } = await pool.query<Team>(
    `SELECT *
     FROM teams
     WHERE id = $1`,
    [team_id]
  );

  if (rows.length === 0) throw new Error(`Team not found: ${team_id}`);
  return rows[0];
}


export async function GetTeamBySlug(slug: string): Promise<Team> {
  const { rows } = await pool.query<Team>(
    `SELECT *
     FROM teams
     WHERE slug = $1`,
    [slug]
  );

  if (rows.length === 0) throw new Error(`Team not found: ${slug}`);
  return rows[0];
}
//==============================================================================
// Team CREATE functions
//==============================================================================

export async function AddNewTeam(team: Team, season_id: string): Promise<Team> {
  const { rows } = await pool.query<Team>(
    `INSERT INTO teams (slug, name, captain_name, captain_email, co_captain_name, co_captain_email, editing_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      team.slug,
      team.name,
      team.captain_name,
      team.captain_email,
      team.co_captain_name,
      team.co_captain_email,
      team.editing_status,
    ]
  );

  const created = rows[0];
  await AddNewTeamToSeason(season_id, created.id);

  return created;
}

export async function AddNewTeamToSeason(season_id: string, team_id: string): Promise<void> {
  await pool.query(
    `INSERT INTO season_teams (season_id, team_id)
     VALUES ($1,$2)`,
    [season_id, team_id]
  );
}




//==============================================================================
// Team UPDATE functions
//==============================================================================
export async function UpdateTeam(team: Team): Promise<Team> {
  const { rows } = await pool.query<Team>(
    `UPDATE teams
     SET slug = $1,
         name = $2,
         captain_name = $3,
         captain_email = $4,
         co_captain_name = $5,
         co_captain_email = $6,
         editing_status = $7
     WHERE id = $8
     RETURNING *`,
    [
      team.slug,
      team.name,
      team.captain_name,
      team.captain_email,
      team.co_captain_name,
      team.co_captain_email,
      team.editing_status,
      team.id,
    ]
  );

  if (rows.length === 0) throw new Error(`repo failed to update ${team.id}`);
  return rows[0];
}

export async function MarkTeamDeleted(team_id: string): Promise<Team> {
  const { rows } = await pool.query<Team>(
    `UPDATE teams
     SET editing_status = 'deleted'
     WHERE id = $1
     RETURNING *`,
    [team_id]
  );

  if (rows.length === 0) throw new Error(`repo failed to delete ${team_id}`);
  return rows[0];
}
