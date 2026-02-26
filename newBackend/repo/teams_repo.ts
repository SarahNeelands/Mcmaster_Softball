
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
// Team GET functions
//==============================================================================

export async function AddNewTeam(team: Team)
{
    const {rows} = pool.query<Team>(
    `INSERT INTO teams (slug, name, captain_name, captain_email, co_captain_name, co_captain_email, editing_status)
    VALUES($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`,[team.slug, team.name, team.captain_name, team.captain_email, team.co_captain_name, team.co_captain_email, team.editing_status]);
    return rows; 
}