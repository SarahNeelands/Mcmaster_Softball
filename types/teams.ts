/**
 * teams.ts
 * --------
 * Shared TypeScript types for teams, games, standings, and roster data.
 * Shapes mirror the planned Supabase tables to make swapping the mock data
 * provider for real queries a drop-in change.
 */


export interface Team {
  id: string;
  slug: string;
  name: string;
  captainName: string;
  captainEmail: string;
  coCaptainName: string;
  coCaptainEmail: string;
  currentRanking?: number;
  division?: string;
  standing?: Standing[];
}

export interface Standing {
  id: string;
  seasonId: string;
  wins: number;
  losses: number;
  ties: number;
  points: number;
  seriesID: string;
  ranking?: number;
}
