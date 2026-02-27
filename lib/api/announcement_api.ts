
import { Announcement } from "@/backend/models/announcement_mod";

export async function GetAnnouncements(season_id: string, status: "active" | "archived"): Promise<Announcement[]> {
  const url = `/api/announcements?season_id=${encodeURIComponent(season_id)}&status=${encodeURIComponent(status)}`;

  const res = await fetch(url); 
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function CreateAnnouncement(data: Announcement) {
  const res = await fetch("/api/announcements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function UpdateAnnouncement(data: Announcement) {
  const res = await fetch("/api/announcements", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function DeleteAnnouncement(data: Announcement) {
  const res = await fetch("/api/announcements", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}