import { Team } from "@/types/teams";
import { API_BASE_URL } from "@/lib/config";

export async function fetchAllTeams(): Promise<Team[]> {
  const response = await fetch(`${API_BASE_URL}/teams`);
  if (!response.ok) {
    throw new Error("Failed to fetch teams");
  }
  return response.json();
}

export async function fetchTeamById(id: string): Promise<Team> {
  const response = await fetch(`${API_BASE_URL}/teams/get?id=${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch team");
  }
  return response.json();
}
export async function fetchTeamBySlug(slug: string): Promise<Team | null> {
  const res = await fetch(
    `${API_BASE_URL}/teams/getBySlug?slug=${encodeURIComponent(slug)}`
  );

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch team: ${res.status}`);

  return (await res.json()) as Team;
}
