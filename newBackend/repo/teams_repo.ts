
import {Team} from "../models/team_mod"
import {pool} from "../database/db"
//==============================================================================
// Team GET functions
//==============================================================================

export async function GetAllTeams(season_id: string)
{
    const {rows} = pool.query<Team>(
    `SELECT *
    FROM teams
    WHERE season_id =$1`,[season_id]);
    return rows;
}

export async function GetTeamsById(team_id: string)
{
    const {rows} = pool.query<Team>(
    `SELECT *
    FROM teams
    WHERE id =$1`,[team_id]);
    return rows;
}