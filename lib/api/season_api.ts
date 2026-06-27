
import { Season } from "@/types/season_mod";

export async function GetSeasons(season_id: string, type: "current" | "specific" | "all"): Promise<Season[]> {
  const params = new URLSearchParams({
    type,
  });

  if (season_id) {
    params.set("season_id", season_id);
  }

  const url = `/api/seasons?${params.toString()}`;

  const res = await fetch(url, { cache: "no-store" }); 
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

export async function PrepareSeasonScoreRequests(season_id: string) {
  const res = await fetch("/api/score-requests/season", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ season_id }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
