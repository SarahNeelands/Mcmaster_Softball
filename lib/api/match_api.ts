
import { Match } from "@/backend/models/match_mod";

export async function GetSeasonMatches(season_id: string): Promise<Match[]> {
  const url = `/api/matches?season_id=${encodeURIComponent(season_id)}}`;

  const res = await fetch(url); 
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function CreateMatch(data: Match) {
  const res = await fetch("/api/matches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function UpdateMatch(data: Match) {
  const res = await fetch("/api/matches", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function DeleteMatch(data: Match) {
  const res = await fetch("/api/matches", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}