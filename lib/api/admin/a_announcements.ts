import { Announcement } from "@/types/announcements";
import { API_BASE_URL } from "@/lib/config";

export async function addNewAnnouncement( title: string, content: string, date: string): Promise<Announcement> {
    
  const response = await fetch (`${API_BASE_URL}/announcements/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      content,
      date,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create announcement: ${text}`);
  }
  return await response.json();
}

export async function editAnnouncement( id: string, title: string, content: string, date: string, archived: boolean): Promise<Announcement> {
  const response = await fetch (`${API_BASE_URL}/announcements/edit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      title,
      content,
      date,
      archived,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to edit announcement: ${text}`);
  }
  return await response.json();
}