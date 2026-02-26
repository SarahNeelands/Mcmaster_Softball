
import {Team} from "../models/team_mod"
import {pool} from "../database/db"
//==============================================================================
// Team GET functions
//==============================================================================

export async function GetAllTeamsOfSeason(season_id: string): Promise<string[]>
{
    const {rows} = pool.query<string>(
    `SELECT team_id
    FROM season_teams 
    WHERE season_id =$1`,[season_id]);
    return rows;
}

export async function GetTeamById(team_id: string): Promise<Team>
{
    const {rows} = pool.query<Team>(
    `SELECT *
    FROM teams
    WHERE id =$1`,[team_id]);
    return rows;
}

//==============================================================================
// Team CREATE functions
//==============================================================================

export async function AddNewTeam(team: Team, season_id: string): Promise<Team>
{
    const {rows} = pool.query<Team>(
    `INSERT INTO teams (slug, name, captain_name, captain_email, co_captain_name, co_captain_email, editing_status)
    VALUES($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`,[team.slug, team.name, team.captain_name, team.captain_email, team.co_captain_name, team.co_captain_email, team.editing_status]);
    await AddNewTeamToSeason(season_id, rows.id)
    return rows; 
}

export async function AddNewTeamToSeason(season_id: string, team_id: string): Promise<string[]>
{
    const {rows} = pool.query<string>(
    `INSERT INTO season_teams (season_id, team_id)
    VALUES($1,$2)`,[season_id, team_id]);
    return rows;
}





//==============================================================================
// Team UPDATE functions
//==============================================================================
export async function UpdateTeam(team: Team): Promise<Team>
{
    const {rows} = await pool.query<Team> (
        `UPDATE teams
        SET =$1
        slug =$2
        name =$3
        captain_name =$4
        captain_email =$5
        co_captain_name =$6
        co_captain_email =$7
        editing_status =$8
        WHERE id = $9
        RETURNING *`,
        [team.slug, team.name, team.captain_name, team.captain_email, team.co_captain_name, team.co_captain_email, team.editing_status]);
    if (rows.length ===0){throw new Error (`repo failed to update ${team.id}`);}
    return rows;
}