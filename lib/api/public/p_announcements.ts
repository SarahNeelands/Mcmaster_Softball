import { Announcement } from "@/types/announcements";
import { API_BASE_URL } from "@/lib/config";

export async function fetchActiveAnnouncements(): Promise<Announcement[]> {
    const response = await fetch (`${API_BASE_URL}/announcements/active` );
    if (!response.ok) {
        throw new Error("Failed to fetch active announcements");
    }
    return response.json();
}
export async function fetchAllAnnouncements(): Promise<Announcement[]> {
    const response = await fetch (`${API_BASE_URL}/announcements`);
    if (!response.ok){
        throw new Error ("Failed to fetch all announcements");
    }
    return response.json();
}

export async function fetchArchivedAnnouncements(): Promise<Announcement[]> {
    const response = await fetch (`${API_BASE_URL}/announcements/archived`);
    if (!response.ok){
        throw new Error ("Failed to fetch archived announcements");
    }
    return response.json();
}