import { Announcement } from "../models/announcement_mod";
import * as repo from "../repo/announcements_repo"

//==============================================================================
// Announcements Adding functions
//==============================================================================
export async function AddNewAnnouncement(announcement: Announcement) {
    const data = await repo.AddNewAnnouncement(announcement);
    return data;
}


//==============================================================================
// Announcements Editing functions
//==============================================================================

export async function UpdateAnnouncement(announcement: Announcement)
{
    const data = await repo.UpdateAnnouncement(announcement);
    return data;
}

//==============================================================================
// Announcements Retrieving functions
//==============================================================================

export async function GetActiveAnnouncements(season_id: string) 
{
    const data = await repo.GetActiveAnnouncements(season_id);
    return data;
}

export async function GetArchivedAnnouncements(season_id: string)
{
    const data = await repo.GetArchivedAnnouncements(season_id);
    return data;
}

//==============================================================================
// Announcements Deleting functions
//==============================================================================

export async function DeleteAnnouncement(announcement: Announcement) 
{
    announcement.editing_status = "deleted";
    const data = await repo.UpdateAnnouncement(announcement);
    return data;
}