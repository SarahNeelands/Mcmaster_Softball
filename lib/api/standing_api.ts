import { Standing } from "@/types/standing_mod";

export async function GetSeriesStandings(series_id: string): Promise<Standing[]> {
  const params = new URLSearchParams({
    type: "series",
  });

  if (series_id) {
    params.set("series_id", series_id);
  }

  const url = `/api/standings?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function GetDivisionStandings(division_id: string): Promise<Standing[]> {
  const params = new URLSearchParams({
    type: "division",
  });

  if (division_id) {
    params.set("division_id", division_id);
  }

  const url = `/api/standings?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function GetTeamStanding(team_id: string, series_id: string): Promise<Standing | null> {
  const params = new URLSearchParams({
    type: "team",
  });

  if (team_id) {
    params.set("team_id", team_id);
  }

  if (series_id) {
    params.set("series_id", series_id);
  }

  const url = `/api/standings?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
