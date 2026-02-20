import { Team } from "@/types/teams";
import { API_BASE_URL } from "@/lib/config";


export async function updateTeam(team: Team): Promise<Team> {
  const response = await fetch(`${API_BASE_URL}/teams/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(team),
    });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update team: ${text}`);
  }
  return await response.json();
}

export async function addNewTeam(team: Team): Promise<Team> {
  const response = await fetch(`${API_BASE_URL}/teams/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(team),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to add team: ${text}`);
  }
  return await response.json();
}

export async function deleteTeam(teamId: string): Promise<Team> {
  const response = await fetch(`${API_BASE_URL}/teams/delete?id=${teamId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to delete team: ${text}`);
  }
  return await response.json();
}