import type { Request, Response } from "express";
import * as service from "../services/season_services";
import {Season} from "../models/season_mod"


//==============================================================================
// Season GET functions
//==============================================================================
export async function GetAllSeasons(res: Response): Promise<Response<Season[] | { error: string }>> 
{
    try {
        const seasons = await service.GetAllSeasons();
        return res.status(201).json(seasons);
    } catch (error) {return res.status(500).json({ error: `Failed to get all seasons` });}
}

export async function GetCurrentSeason(res: Response): Promise<Response<Season[] | { error: string }>> 
{
    try {
        const season = await service.GetCurrentSeason();
        return res.status(201).json(season);
    } catch (error) {return res.status(500).json({ error: `Failed to get current season` });}
}
//==============================================================================
// Season CREATE functions
//==============================================================================

export async function CreateNewSeason(req: Request, res: Response): Promise<Response<Season | {error: string}>>
{
    try
    {
        const season = await service.CreateNewSeason(req.body);
        return res.status(201).json(season);
    }
    catch (error) {return res.status(500).json({error: `Failed to create a new season`})}
}

//==============================================================================
// Season UPDATE functions
//==============================================================================
export async function UpdateSeason(req: Request, res: Response): Promise<Response<Season | {error: string}>>
{
    try
    {
        const season = await service.UpdateSeason(req.body);
        return res.status(201).json(season);
    }
    catch (error) {return res.status(500).json({error: `Failed to update ${req.body.id}`})}
}

//==============================================================================
// Season DELETE functions
//==============================================================================

export async function DeleteSeason(req: Request, res: Response)
{
    try
    {
        const season = await service.DeleteSeason(req.body);
        res.status(201).json(season);
    }
    catch (error) { res.status(500).json({error: `Failed to update ${req.body.id}`})}
}
