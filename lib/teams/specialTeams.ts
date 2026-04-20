import type { Match } from "@/types/match_mod";
import type { Team } from "@/types/team_mod";

export const EMPTY_SLOT_TEAM_NAME = "Empty";
export const EMPTY_SLOT_SLUG_PREFIX = "empty-slot-";

export function buildEmptySlotSlug(seasonId: string): string {
  return `${EMPTY_SLOT_SLUG_PREFIX}${seasonId}`.toLowerCase();
}

export function isEmptySlotTeam(team: Pick<Team, "name" | "slug"> | null | undefined): boolean {
  if (!team) return false;

  return (
    team.slug.startsWith(EMPTY_SLOT_SLUG_PREFIX) &&
    team.name.trim().toLowerCase() === EMPTY_SLOT_TEAM_NAME.toLowerCase()
  );
}

export function filterOutEmptySlotTeams<T extends Pick<Team, "name" | "slug">>(teams: T[]): T[] {
  return teams.filter((team) => !isEmptySlotTeam(team));
}

export function getEmptySlotTeam<T extends Pick<Team, "name" | "slug">>(teams: T[]): T | undefined {
  return teams.find((team) => isEmptySlotTeam(team));
}

export function isOpenSlotMatch(
  match: Pick<Match, "home_team_id" | "away_team_id">,
  emptySlotTeamIds: Set<string>
): boolean {
  return (
    emptySlotTeamIds.has(match.home_team_id) ||
    emptySlotTeamIds.has(match.away_team_id)
  );
}

export const isEmptySlotMatch = isOpenSlotMatch;
