import { Standing } from "@/types/standing_mod";

export async function GetSeriesStandings(series_id: string): Promise<Standing[]> {
  const url = `/api/standings?series_id=${encodeURIComponent(series_id)}&type=series`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function GetDivisionStandings(division_id: string): Promise<Standing[]> {
  const url = `/api/standings?division_id=${encodeURIComponent(division_id)}&type=division`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function GetTeamStanding(team_id: string, series_id: string): Promise<Standing | null> {
  const url = `/api/standings?team_id=${encodeURIComponent(team_id)}&series_id=${encodeURIComponent(series_id)}&type=team`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
