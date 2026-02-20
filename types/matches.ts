/**
 * matches.ts
 * -----------
 * Shared TypeScript types for match schedule and result data sourced via Supabase.
 */

export interface Match {
  id: string;
  date: string;
  time: string;
  homeTeamID: string;
  awayTeamID: string;
  field: string;
  homeScore?: number;
  awayScore?: number;
  editingStatus?: "draft" | "published" | "deleted";
}

export interface Game {
  id?: string;
  homeTeamID: string;
  awayTeamID: string;
  field: string;
}

export interface TimeBlock {
  time: string;
  games: Game[];
}

export interface ScheduleDay {
  date: string;
  timeBlocks: TimeBlock[];
}


