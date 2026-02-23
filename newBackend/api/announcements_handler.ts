// newBackend/api/matches.api.ts
import type { Request, Response } from "express";
import * as service from "../services/announcement_services"

//==============================================================================
// Announcements Adding functions
//==============================================================================
export async function AddNewAnnouncement(req: Request, res: Response) {
    try {
        const announcement = await service.AddNewAnnouncement(req.body);
        return res.status(201).json(announcement);
    } catch (error) {res.status(500).json({ error: `Failed to create a new announcement` });}
}

//==============================================================================
// Announcements Editing functions
//==============================================================================
export async function UpdateAnnouncement(req: Request, res: Response) {
    try 
    {
        const announcement = await service.UpdateAnnouncement(req.body);
        return res.status(201).json(announcement);
    }catch (error) {res.status(500).json({ error: `Failed to update announcement ${req.body.id}` });}
}

//==============================================================================
// Announcements Retrieving functions
//==============================================================================
export async function GetActiveAnnouncements(req: Request, res: Response) {
    try 
    {
        const announcement = await service.GetActiveAnnouncements(req.body);
        return res.status(201).json(announcement);
    }catch (error) {res.status(500).json({ error: `Failed to get active announcements` });}
} 

export async function GetArchivedAnnouncements(req: Request, res: Response) {
    try 
    {
        const announcement = await service.GetArchivedAnnouncements(req.body);
        return res.status(201).json(announcement);
    }catch (error) {res.status(500).json({ error: `Failed to get archived announcements` });}
} 
//==============================================================================
// Announcements Deleting functions
//==============================================================================
export async function DeleteAnnouncement(req: Request, res: Response) {
    try 
    {
        const announcement = await service.DeleteAnnouncement(req.body);
        return res.status(201).json(announcement);
    }catch (error) {res.status(500).json({ error: `Failed to delete announcement ${req.body.id}` });}
} 