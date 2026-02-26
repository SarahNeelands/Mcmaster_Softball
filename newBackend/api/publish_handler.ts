
import type { Request, Response } from "express";
import * as service from "../services/publish_services";


export async function Publish(res: Response)
{
    try {
        const rule = await service.Publish();
    } catch (error) {res.status(500).json({ error: `Failed to publish` });}
}
