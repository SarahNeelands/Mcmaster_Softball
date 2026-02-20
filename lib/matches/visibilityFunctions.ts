import { Match } from "@/types/matches";
import { compareByDateThenTime } from "./sortingFunctions";


export function getVisibleMatches(
  matches: Match[],
  days = 2,
  direction: "upcoming" | "previous" = "upcoming"
) {
  const sorted = [...matches].sort((a, b) => {
    const cmp = compareByDateThenTime(a, b);
    return direction === "previous" ? -cmp : cmp;
  });

  const dates: string[] = [];
  for (const match of sorted) {
    if (!dates.includes(match.date)) {
      dates.push(match.date);
    }
    if (dates.length === days) break;
  }

  return sorted.filter(m => dates.includes(m.date));
}

export function formatDateLabel(date: string): string {
    const [year, month, day] = date.split("-").map(Number);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    return `${monthNames[month - 1]} ${day}`;
  };

export function formatScore(score: number | undefined | null): string {
  return typeof score === "number" ? score.toString() : "-";
}