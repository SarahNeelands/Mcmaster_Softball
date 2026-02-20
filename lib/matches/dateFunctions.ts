// lib/matches/dateFunctions.ts
import type { Match } from "@/types/matches";

/**
 * Parse a "YYYY-MM-DD" string as a LOCAL calendar date (no timezone shifting).
 * This is the #1 rule: never use new Date("YYYY-MM-DD") directly.
 */
export function parseYMDLocal(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Returns "today" at local midnight (00:00:00) */
export function todayLocalMidnight(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

/** Compare two YYYY-MM-DD strings chronologically */
export function compareYMD(a: string, b: string): number {
  // If they are guaranteed "YYYY-MM-DD", string compare is correct.
  return a.localeCompare(b);
}


/**
 * Split matches into previous/upcoming.
 * - previous: before today OR has scores
 * - upcoming: today+ and no scores
 */
export function splitMatchesByToday(games: Match[]) {
  const today = todayLocalMidnight();

  const previous = games
    .filter((g) => parseYMDLocal(g.date) < today )
    .sort((a, b) => compareYMD(b.date, a.date));

  const upcoming = games
    .filter((g) => parseYMDLocal(g.date) >= today )
    .sort((a, b) => compareYMD(a.date, b.date));

  return { upcoming, previous };
}

/**
 * Build Calendar months from matches.
 * monthCount = how many months starting from current month to include.
 */
export function buildMonthsFromMatches(games: Match[], monthCount = 2) {
  const start = new Date();
  const months: { year: number; month: number; matches: Match[] }[] = [];

  for (let i = 0; i < monthCount; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-based

    const matches = games.filter((g) => {
      const gd = parseYMDLocal(g.date);
      return gd.getFullYear() === year && gd.getMonth() === month;
    });

    months.push({ year, month, matches });
  }

  return months;
}
