import { Series } from "@/types/series_mod";

export async function GetSeries(
  series_id: string,
  season_id: string,
  type: "current" | "specific" | "all"
): Promise<Series[] | Series> {
  const url = `/api/series?series_id=${encodeURIComponent(series_id)}&season_id=${encodeURIComponent(season_id)}&type=${encodeURIComponent(type)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function CreateSeries(series: Series, season_id: string) {
  const res = await fetch("/api/series", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ series, season_id }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function UpdateSeries(data: Series) {
  const res = await fetch("/api/series", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function DeleteSeries(data: Series) {
  const res = await fetch("/api/series", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
