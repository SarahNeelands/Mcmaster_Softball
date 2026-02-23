import type { Request, Response } from "express";
import * as service from "../services/rule_services";

//==============================================================================
// Rules Creating functions
//==============================================================================
export async function AddNewRule(req: Request, res: Response)
{
    try {
        const rule = await service.AddNewRule(req.body);
        return res.status(201).json(rule);
    } catch (error) {res.status(500).json({ error: `Failed to get all rules` });}
}

//==============================================================================
// Rules Retrieving functions
//==============================================================================

export async function GetAllRules(res: Response)
{
    try {
        const rule = await service.GetAllRules();
        return res.status(201).json(rule);
    } catch (error) {res.status(500).json({ error: `Failed to get all rules` });}
}

//==============================================================================
// Rules Updating functions
//==============================================================================

export async function UpdateRule(req: Request, res: Response)
{
    try {
        const rule = await service.UpdateRule(req.body);
        return res.status(201).json(rule);
    } catch (error) {res.status(500).json({ error: `Failed to update rule ${req.body.id}` });}
}
//==============================================================================
// Rule Deleting functions
//==============================================================================
export async function DeleteAnnouncement(req: Request, res: Response) {
    try 
    {
        const announcement = await service.DeleteRule(req.body);
        return res.status(201).json(announcement);
    }catch (error) {res.status(500).json({ error: `Failed to delete rule ${req.body.id}` });}
} 