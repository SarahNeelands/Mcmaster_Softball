import { Match } from "@/types/matches";
import { API_BASE_URL } from "@/lib/config";

export async function fetchUpcomingMatches(): Promise<Match[]> {
  const response = await fetch(`${API_BASE_URL}/matches/upcoming`);
  if (!response.ok) {
    throw new Error("Failed to fetch upcoming matches");
  }
  return response.json();
}

export async function fetchPreviousMatches(): Promise<Match[]> {
  const response = await fetch(`${API_BASE_URL}/matches/previous`);
  if (!response.ok) {
    throw new Error("Failed to fetch previous matches");
  }
  return response.json();
}

export async function fetchUpcomingMatchesByTeam(team: string): Promise<Match[]> {
  const response = await fetch(`${API_BASE_URL}/matches/team?team=${team}`);
  if (!response.ok) {
    throw new Error("Failed to fetch upcoming matches");
  }
  return response.json();
}