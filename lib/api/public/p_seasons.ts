import { Team } from "@/types/teams";
import { Season, Standing, Series } from "@/types/seasons";
import { API_BASE_URL } from "@/lib/config";

export async function GetCurrentSeason(): Promise<Season> {
  const response = await fetch(`${API_BASE_URL}/getCurrentSeason`);
  if (!response.ok) {
    throw new Error("Failed to fetch current season");
  }
  return response.json();
}

export async function GetCurrentSeasonSeries(): Promise<Series> {
  const response = await fetch(`${API_BASE_URL}/teams/getCurrentSeasonSeries`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `GetCurrentSeasonSeries failed: ${response.status} ${response.statusText} :: ${body}`
    );
  }

  return response.json();
}


export async function GetTeamsByDivisionID(divisionId: string): Promise<Team[]> {
  const response = await fetch(`${API_BASE_URL}/teams/getByDivision?division=${divisionId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch teams by division");
  }
  return response.json();
}
