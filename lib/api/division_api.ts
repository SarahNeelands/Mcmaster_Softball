import { Division } from "@/types/division_mod";

export async function GetDivisions(
  division_id: string,
  series_id: string,
  type: "specific" | "all"
): Promise<Division[] | Division> {
  const url = `/api/divisions?division_id=${encodeURIComponent(division_id)}&series_id=${encodeURIComponent(series_id)}&type=${encodeURIComponent(type)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function CreateDivision(division: Division, series_id: string) {
  const res = await fetch("/api/divisions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ division, series_id }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function UpdateDivision(data: Division) {
  const res = await fetch("/api/divisions", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function MoveDivisionTeam(
  team_id: string,
  source_division_id: string,
  target_division_id: string,
  series_id?: string
) {
  const res = await fetch("/api/divisions", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "move_team",
      team_id,
      source_division_id,
      target_division_id,
      series_id,
    }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function DeleteDivision(data: Division) {
  const res = await fetch("/api/divisions", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
