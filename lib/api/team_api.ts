
import { Team } from "@/types/team_mod";

export async function GetSeasonTeams(season_id: string): Promise<Team[]> {
  const url = `/api/teams?id=${encodeURIComponent(season_id)}&type=all`;

  const res = await fetch(url); 
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function GetTeam(id: string): Promise<Team[]> {
  const url = `/api/teams?id=${encodeURIComponent(id)}&type=specific`;

  const res = await fetch(url); 
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


export async function CreateTeam(team: Team, season_id: string) {
  const res = await fetch("/api/teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      team,
      season_id,
    }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function UpdateTeam(data: Team) {
  const res = await fetch("/api/teams", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function DeleteTeam(team: Team) {
  const res = await fetch("/api/teams", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(team),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}