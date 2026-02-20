import { Match } from "../../types/matches";

export interface MatchesByMonth {
  year: number;
  month: number;
  matches: Match[];
}


const toMinutes = (time: string) => {
  const [t, modifier] = time.split(" ");
  let [hours, minutes] = t.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

export function compareByDateThenTime(a: Match, b: Match) {
  if (a.date !== b.date) {
    return a.date.localeCompare(b.date);
  }
  return toMinutes(a.time) - toMinutes(b.time);
}

export function groupMatchesByMonth(matches: Match[]): MatchesByMonth[] {
  const map = new Map<string, MatchesByMonth>();

  for (const match of matches) {
    const d = new Date(match.date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const key = `${year}-${month}`;

    if (!map.has(key)) {
      map.set(key, { year, month, matches: [] });
    }

    map.get(key)!.matches.push(match);
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      a.year !== b.year
        ? a.year - b.year
        : a.month - b.month
  );
}