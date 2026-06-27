import { Division } from "@/types/division_mod";

export async function GetDivisions(
  division_id: string,
  series_id: string,
  type: "specific" | "all"
): Promise<Division[] | Division> {
  const params = new URLSearchParams({
    type,
  });

  if (division_id) {
    params.set("division_id", division_id);
  }

  if (series_id) {
    params.set("series_id", series_id);
  }

  const url = `/api/divisions?${params.toString()}`;

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
