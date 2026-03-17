
import { Match } from "@/types/match_mod";

export async function GetSeasonMatches(season_id: string): Promise<Match[]> {
  const params = new URLSearchParams({
    type: "all",
    season_id,
  });

  const res = await fetch(`/api/matches?${params.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function GetTeamsSeasonMatches(
  team_id: string,
  season_id: string
): Promise<Match[]> {
  const params = new URLSearchParams({
    type: "team",
    season_id,
    team_id,
  });

  const res = await fetch(`/api/matches?${params.toString()}`);
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