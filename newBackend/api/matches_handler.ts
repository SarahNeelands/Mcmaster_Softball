import type { Request, Response } from "express";
import * as service from "../services/match_services";

//==============================================================================
// Matches Creating functions
//==============================================================================
export async function AddNewMatches(req: Request, res: Response) {
  try {
    const matches = req.body;

    if (!Array.isArray(matches)) {
      return res.status(400).json({ error: "Body must be an array of matches" });
    }

    const created = await Promise.all(matches.map(m => service.AddNewMatch(m)));

    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create matches" });
  }
}
//==============================================================================
// Matches Retrieving functions
//==============================================================================

export async function GetAllMatches(res: Response)
{
    try {
        const rule = await service.GetAllMatches();
        return res.status(201).json(rule);
    } catch (error) {res.status(500).json({ error: `Failed to get all matches` });}
}

//==============================================================================
// Matches Updating functions
//==============================================================================

export async function UpdateMatches(req: Request, res: Response)
{
  try 
  {
    const matches = req.body;

    if (!Array.isArray(matches)) {
      return res.status(400).json({ error: "Body must be an array of matches" });
    }
    const updated = await Promise.all(matches.map(m => service.UpdateMatch(m)))
    return res.status(201).json(updated);
  } catch (error) {return res.status(500).json({ error: "Failed to update matches" });}
}
//==============================================================================
// Matches Deleting functions
//==============================================================================
export async function DeleteAnnouncement(req: Request, res: Response) {
    try 
    {
        const matches = req.body
        if (!Array.isArray(matches))
        {
            return res.status(400).json({error: "Body must be an array of matches" })
        }
        const deleted = await Promise.all(matches.map(m => service.DeleteMatch(m)))
        return res.status(201).json(deleted)
    }catch (error) {res.status(500).json({ error: `Failed to delete matches` });}
} 