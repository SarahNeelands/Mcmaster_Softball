import { Match, ScheduleDay } from "@/types/matches";
import { API_BASE_URL } from "@/lib/config";

export async function updateMatch( match: Match): Promise<Match> {
  const response = await fetch (`${API_BASE_URL}/matches/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ID: match.id,
        Date: match.date,
        Time: match.time,
        HomeTeam: match.homeTeam,
        AwayTeam: match.awayTeam,
        Field: match.field,
        HomeScore: match.homeScore,
        AwayScore: match.awayScore,
      }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to edit match: ${text}`);
  }
  return await response.json();
    
}

export async function deleteMatch( match: Match): Promise<Match> {
  const response = await fetch (`${API_BASE_URL}/matches/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ID: match.id,
      }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to delete match: ${text}`);
  }
  return await response.json();
    
}

export async function createNewMatch( match: Match): Promise<Match> {
  const response = await fetch (`${API_BASE_URL}/matches/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Date: match.date,
        Time: match.time,
        HomeTeam: match.homeTeam,
        AwayTeam: match.awayTeam,
        Field: match.field,
        HomeScore: match.homeScore,
        AwayScore: match.awayScore,
      }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create new match: ${text}`);
  }
  return await response.json();
    
}

export async function changeSchedule( days: ScheduleDay[]):  Promise<void>{
  const response = await fetch (`${API_BASE_URL}/matches/schedule`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({ days }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to change day schedule: ${text}`);
  }
  return await response.json();
} 