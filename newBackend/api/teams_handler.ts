import type { Request, Response } from "express";
import * as service from "../services/team_services";
import type {Team} from "../models/team_mod"
//==============================================================================
// Teams Creating functions
//==============================================================================
export async function AddNewTeams(req: Request, res: Response) {
  try {
    const teams = req.body;

    if (!Array.isArray(teams)) {
      return res.status(400).json({ error: "Body must be an array of teams" });
    }

    const created = await Promise.all(teams.map(m => service.AddNewTeam(m)));

    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create teams" });
  }
}
//==============================================================================
// Teams Retrieving functions
//==============================================================================

export async function GetAllSeasonsTeams(req: Request, res: Response): Promise<Response<Team[] | { error: string }>> 
{
    try {
        const seasonId = req.params.seasonId; // this is a string
        const teams_ids = await service.GetAllTeamsOfSeason(seasonId);
        const teams = teams_ids.map((m) => service.GetTeamById(m))
        return res.status(201).json(teams);
    } catch (error) {return res.status(500).json({ error: `Failed to get all teams` });}
}

//==============================================================================
// Teams Updating functions
//==============================================================================

export async function UpdateTeams(req: Request, res: Response): Promise<Response<Team[] | { error: string }>> 
{
  try 
  {
    const teams = req.body;

    if (!Array.isArray(teams)) {
      return res.status(400).json({ error: "Body must be an array of teams" });
    }
    const updated = await Promise.all(teams.map(m => service.UpdateTeam(m)))
    return res.status(201).json(updated);
  } catch (error) {return res.status(500).json({ error: "Failed to update teams" });}
}
//==============================================================================
// Team Deleting functions
//==============================================================================
export async function DeleteTeam(req: Request, res: Response) {
    try 
    {
        const deleted = await service.DeleteTeam(req.body)
        return res.status(201).json(deleted)
    }catch (error) {res.status(500).json({ error: `Failed to delete team` });}
} 