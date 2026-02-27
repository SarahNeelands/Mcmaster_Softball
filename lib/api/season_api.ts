
import { Season } from "@/backend/models/season_mod";

export async function GetSeasons(season_id: string, type: "current" | "specific" | "all"): Promise<Season[]> {
  const url = `/api/seasons?season_id=${encodeURIComponent(season_id)}&type=${encodeURIComponent(type)}`;

  const res = await fetch(url); 
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function CreateSeason(data: Season) {
  const res = await fetch("/api/seasons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function UpdateSeason(data: Season) {
  const res = await fetch("/api/seasons", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function DeleteSeason(data: Season) {
  const res = await fetch("/api/seasons", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}